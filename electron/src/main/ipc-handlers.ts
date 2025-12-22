import { ipcMain, dialog, BrowserWindow, protocol, net } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { checkMastraRunning, getMastraPort } from './mastra';

// Types for artifacts browsing
interface FolderNode {
  id: string;
  name: string;
  type: 'year' | 'week' | 'category';
  isExpanded?: boolean;
  itemCount?: number;
  children?: FolderNode[];
}

interface Artifact {
  id: string;
  name: string;
  title: string;
  categoryId: string;
  weekId: string;
  weekName: string;
  categoryName: string;
  imagePath: string;
  markdownPath: string;
  markdownContent: string;
  fileTypes: string[];
  createdAt: string;
}

interface ArtifactsResult {
  success: boolean;
  folderTree?: FolderNode[];
  artifacts?: Artifact[];
  error?: string;
}

// Contextualize types
interface WeekStats {
  commits: number;
  screenshots: number;
  ideas: number;
  topCategory: string;
}

interface WeekSummary {
  status: 'pending' | 'generating' | 'generated';
  generatedAt: string | null;
  narrative: string | null;
  fullContent: string | null;
  highlights: string[];
  stats: WeekStats;
}

interface Week {
  id: string;
  label: string;
  dateRange: string;
  year: number;
  artifactCount: number;
  categories: string[];
  summary: WeekSummary;
  threadCount: number;
}

interface WeeksResult {
  success: boolean;
  weeks?: Week[];
  error?: string;
}

// Configuration interface
interface AppConfig {
  artifactsFolder: string;
  apiKey: string;
  setupComplete: boolean;
}

// Path to store configuration
function getConfigPath(): string {
  const configDir = path.join(os.homedir(), '.artifact-engine');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  return path.join(configDir, 'config.json');
}

// Load configuration
function loadConfig(): AppConfig {
  const configPath = getConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Config] Failed to load config:', err);
  }
  return {
    artifactsFolder: '',
    apiKey: '',
    setupComplete: false,
  };
}

// Save configuration
function saveConfig(config: Partial<AppConfig>): { success: boolean; error?: string } {
  const configPath = getConfigPath();
  try {
    const currentConfig = loadConfig();
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export interface GitRepository {
  name: string;
  path: string;
  hasHook: boolean;
}

// Directories to skip during scanning
const SKIP_DIRS = new Set([
  'node_modules',
  '.Trash',
  'Library',
  'Applications',
  '.npm',
  '.cache',
  '.local',
  '.config',
  'Pictures',
  'Music',
  'Movies',
  '.docker',
  'go',
]);

// Path to the git hook template (relative to project root)
function getHookTemplatePath(): string {
  // From electron/dist/main/main/, go up 4 levels to project root
  return path.join(__dirname, '..', '..', '..', '..', '.git-template', 'hooks', 'post-commit');
}

// Path to the artifacts script
function getArtifactsScriptPath(): string {
  // From electron/dist/main/main/, go up 4 levels to project root
  return path.join(__dirname, '..', '..', '..', '..', 'scripts', 'artifacts-categorize-file.sh');
}

// Check if our post-commit hook is installed
function checkHookInstalled(repoPath: string): boolean {
  const hookPath = path.join(repoPath, '.git', 'hooks', 'post-commit');

  if (!fs.existsSync(hookPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(hookPath, 'utf8');
    // Check if it's our hook by looking for the workflow API URL
    return content.includes('commitAnalysisWorkflow');
  } catch {
    return false;
  }
}

// Recursively scan for git repositories
async function scanGitReposRecursive(
  directory: string,
  repos: GitRepository[],
  maxDepth: number,
  currentDepth: number = 0
): Promise<void> {
  if (currentDepth > maxDepth) return;

  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Skip hidden directories (except .git check) and known non-repo dirs
      if (entry.name.startsWith('.') && entry.name !== '.git') continue;
      if (SKIP_DIRS.has(entry.name)) continue;

      const fullPath = path.join(directory, entry.name);

      // Check if this directory contains a .git folder
      const gitPath = path.join(fullPath, '.git');
      if (fs.existsSync(gitPath) && fs.statSync(gitPath).isDirectory()) {
        repos.push({
          name: entry.name,
          path: fullPath,
          hasHook: checkHookInstalled(fullPath),
        });
        // Don't recurse into git repos - they're found
        continue;
      }

      // Recurse into subdirectory
      await scanGitReposRecursive(fullPath, repos, maxDepth, currentDepth + 1);
    }
  } catch (err) {
    // Silently skip directories we can't read (permission errors, etc.)
    console.log(`[Scan] Skipping ${directory}:`, (err as Error).message);
  }
}

// Install git hook to a repository
function installGitHook(repoPath: string): { success: boolean; error?: string } {
  try {
    const hookTemplatePath = getHookTemplatePath();
    const hookDestPath = path.join(repoPath, '.git', 'hooks', 'post-commit');

    // Check if template exists
    if (!fs.existsSync(hookTemplatePath)) {
      return { success: false, error: 'Hook template not found' };
    }

    // Ensure hooks directory exists
    const hooksDir = path.dirname(hookDestPath);
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Copy the hook
    fs.copyFileSync(hookTemplatePath, hookDestPath);

    // Make it executable
    fs.chmodSync(hookDestPath, 0o755);

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// Remove git hook from a repository
function removeGitHook(repoPath: string): { success: boolean; error?: string } {
  try {
    const hookPath = path.join(repoPath, '.git', 'hooks', 'post-commit');

    if (fs.existsSync(hookPath)) {
      // Only remove if it's our hook
      const content = fs.readFileSync(hookPath, 'utf8');
      if (content.includes('commitAnalysisWorkflow')) {
        fs.unlinkSync(hookPath);
        return { success: true };
      } else {
        return { success: false, error: 'Hook exists but is not the Artifact hook' };
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// Setup macOS Folder Action using launchd
function setupFolderAction(): { success: boolean; error?: string; path?: string } {
  if (process.platform !== 'darwin') {
    return { success: false, error: 'Folder Actions are only supported on macOS' };
  }

  try {
    const scriptPath = getArtifactsScriptPath();
    const plistName = 'com.artifacts.desktopwatcher';
    const launchAgentsDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
    const plistPath = path.join(launchAgentsDir, `${plistName}.plist`);
    const desktopPath = path.join(os.homedir(), 'Desktop');

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return { success: false, error: 'Artifacts script not found' };
    }

    // Ensure LaunchAgents directory exists
    if (!fs.existsSync(launchAgentsDir)) {
      fs.mkdirSync(launchAgentsDir, { recursive: true });
    }

    // Create launchd plist
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${plistName}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${scriptPath}</string>
    </array>
    <key>WatchPaths</key>
    <array>
        <string>${desktopPath}</string>
    </array>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/tmp/artifacts-watcher.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/artifacts-watcher.error.log</string>
</dict>
</plist>`;

    // Write plist file
    fs.writeFileSync(plistPath, plistContent);

    // Unload if already loaded, then load
    try {
      execSync(`launchctl unload "${plistPath}" 2>/dev/null || true`, { stdio: 'ignore' });
    } catch {
      // Ignore unload errors
    }

    try {
      execSync(`launchctl load "${plistPath}"`, { stdio: 'inherit' });
    } catch (loadErr) {
      return { success: false, error: `Failed to load launch agent: ${(loadErr as Error).message}` };
    }

    return { success: true, path: plistPath };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// Category name mapping for display
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  '1-Code': 'Code',
  '2-Terminal': 'Terminal',
  '3-Performance': 'Performance',
  '4-Architecture': 'Architecture',
  '5-AI_Agents': 'AI Agents',
};

// Scan artifacts folder and build folder tree and artifacts list
async function scanArtifactsFolder(): Promise<ArtifactsResult> {
  const config = loadConfig();
  const artifactsFolder = config.artifactsFolder;

  if (!artifactsFolder || !fs.existsSync(artifactsFolder)) {
    return {
      success: true,
      folderTree: [],
      artifacts: [],
    };
  }

  const folderTree: FolderNode[] = [];
  const artifacts: Artifact[] = [];

  try {
    // Scan year folders (e.g., 2024, 2025)
    const yearFolders = fs.readdirSync(artifactsFolder, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
      .sort((a, b) => b.name.localeCompare(a.name)); // Newest first

    for (const yearDir of yearFolders) {
      const yearPath = path.join(artifactsFolder, yearDir.name);
      const yearNode: FolderNode = {
        id: `year-${yearDir.name}`,
        name: yearDir.name,
        type: 'year',
        isExpanded: yearFolders.indexOf(yearDir) === 0, // Expand first year
        children: [],
      };

      // Scan week folders (e.g., Week_47_Nov17-Nov23)
      const weekFolders = fs.readdirSync(yearPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name.startsWith('Week_'))
        .sort((a, b) => {
          // Extract week number and sort descending
          const weekA = parseInt(a.name.split('_')[1], 10);
          const weekB = parseInt(b.name.split('_')[1], 10);
          return weekB - weekA;
        });

      for (const weekDir of weekFolders) {
        const weekPath = path.join(yearPath, weekDir.name);
        const weekNode: FolderNode = {
          id: `week-${yearDir.name}-${weekDir.name}`,
          name: weekDir.name,
          type: 'week',
          isExpanded: false,
          children: [],
        };

        // Scan category folders (e.g., 1-Code, 2-Terminal)
        const categoryFolders = fs.readdirSync(weekPath, { withFileTypes: true })
          .filter(d => d.isDirectory() && /^\d+-/.test(d.name))
          .sort((a, b) => a.name.localeCompare(b.name));

        for (const catDir of categoryFolders) {
          const catPath = path.join(weekPath, catDir.name);
          const categoryId = `cat-${yearDir.name}-${weekDir.name}-${catDir.name}`;

          // Find markdown files (artifacts)
          const files = fs.readdirSync(catPath);
          const mdFiles = files.filter(f => f.endsWith('.md'));

          const categoryArtifacts: Artifact[] = [];

          for (const mdFile of mdFiles) {
            const baseName = mdFile.replace('.md', '');
            const mdPath = path.join(catPath, mdFile);
            const pngPath = path.join(catPath, `${baseName}.png`);
            const hasPng = fs.existsSync(pngPath);

            try {
              const mdContent = fs.readFileSync(mdPath, 'utf8');
              const stats = fs.statSync(mdPath);

              // Extract title from first line of markdown
              const firstLine = mdContent.split('\n')[0] || '';
              const title = firstLine.startsWith('# ')
                ? firstLine.slice(2).trim()
                : baseName;

              const fileTypes: string[] = ['.md'];
              if (hasPng) fileTypes.unshift('.png');

              const artifact: Artifact = {
                id: `artifact-${baseName}-${categoryId}`,
                name: baseName,
                title,
                categoryId,
                weekId: `week-${yearDir.name}-${weekDir.name}`,
                weekName: weekDir.name,
                categoryName: CATEGORY_DISPLAY_NAMES[catDir.name] || catDir.name,
                imagePath: hasPng ? pngPath : '',
                markdownPath: mdPath,
                markdownContent: mdContent,
                fileTypes,
                createdAt: stats.mtime.toISOString(),
              };

              categoryArtifacts.push(artifact);
              artifacts.push(artifact);
            } catch (err) {
              console.error(`[Artifacts] Error reading ${mdPath}:`, err);
            }
          }

          const categoryNode: FolderNode = {
            id: categoryId,
            name: catDir.name,
            type: 'category',
            itemCount: categoryArtifacts.length,
          };

          weekNode.children!.push(categoryNode);
        }

        if (weekNode.children!.length > 0) {
          yearNode.children!.push(weekNode);
        }
      }

      if (yearNode.children!.length > 0) {
        folderTree.push(yearNode);
      }
    }

    // Sort artifacts by date, newest first
    artifacts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, folderTree, artifacts };
  } catch (err) {
    console.error('[Artifacts] Error scanning folder:', err);
    return { success: false, error: (err as Error).message };
  }
}

// Parse week folder name to extract label and date range
function parseWeekName(weekName: string): { label: string; dateRange: string } {
  // Format: Week_47_Nov17-Nov23
  const match = weekName.match(/Week_(\d+)_(.+)/)
  if (match) {
    const weekNum = match[1]
    const dateRange = match[2].replace('-', ' - ')
    return {
      label: `Week ${weekNum}`,
      dateRange,
    }
  }
  return { label: weekName, dateRange: '' }
}

// Read week summary from summary.md file if it exists
function readWeekSummary(weekPath: string): WeekSummary {
  const summaryPath = path.join(weekPath, 'summary.md')

  const defaultStats: WeekStats = {
    commits: 0,
    screenshots: 0,
    ideas: 0,
    topCategory: '',
  }

  if (!fs.existsSync(summaryPath)) {
    return {
      status: 'pending',
      generatedAt: null,
      narrative: null,
      fullContent: null,
      highlights: [],
      stats: defaultStats,
    }
  }

  try {
    const content = fs.readFileSync(summaryPath, 'utf8')
    const stats = fs.statSync(summaryPath)

    // Parse the markdown to extract narrative and highlights
    const lines = content.split('\n')
    let narrative = ''
    const highlights: string[] = []
    let inHighlights = false
    let inNarrative = false

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip the title
      if (trimmed.startsWith('# ')) {
        continue
      }

      // Check for highlights section
      if (trimmed.toLowerCase().includes('highlight') || trimmed.toLowerCase().includes('key accomplishment')) {
        inHighlights = true
        inNarrative = false
        continue
      }

      // Check for narrative/overview section
      if (trimmed.toLowerCase().includes('overview') || trimmed.toLowerCase().includes('summary')) {
        inNarrative = true
        inHighlights = false
        continue
      }

      // Parse bullet points in highlights
      if (inHighlights && trimmed.startsWith('- ')) {
        highlights.push(trimmed.slice(2))
      }

      // Parse narrative paragraphs
      if (inNarrative && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
        narrative += (narrative ? ' ' : '') + trimmed
      }

      // If we haven't found a section yet, treat first paragraph as narrative
      if (!inHighlights && !inNarrative && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
        narrative += (narrative ? ' ' : '') + trimmed
      }
    }

    // Limit narrative length
    if (narrative.length > 500) {
      narrative = narrative.slice(0, 500) + '...'
    }

    return {
      status: 'generated',
      generatedAt: stats.mtime.toISOString(),
      narrative: narrative || 'Weekly summary generated.',
      fullContent: content,
      highlights: highlights.slice(0, 5),
      stats: defaultStats, // We'll calculate these from artifacts
    }
  } catch (err) {
    console.error(`[Weeks] Error reading summary ${summaryPath}:`, err)
    return {
      status: 'pending',
      generatedAt: null,
      narrative: null,
      fullContent: null,
      highlights: [],
      stats: defaultStats,
    }
  }
}

// Scan artifacts folder and build weeks data
async function scanWeeksFolder(): Promise<WeeksResult> {
  const config = loadConfig()
  const artifactsFolder = config.artifactsFolder

  if (!artifactsFolder || !fs.existsSync(artifactsFolder)) {
    return { success: true, weeks: [] }
  }

  const weeks: Week[] = []

  try {
    // Scan year folders
    const yearFolders = fs.readdirSync(artifactsFolder, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
      .sort((a, b) => b.name.localeCompare(a.name))

    for (const yearDir of yearFolders) {
      const yearPath = path.join(artifactsFolder, yearDir.name)
      const year = parseInt(yearDir.name, 10)

      // Scan week folders
      const weekFolders = fs.readdirSync(yearPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name.startsWith('Week_'))
        .sort((a, b) => {
          const weekA = parseInt(a.name.split('_')[1], 10)
          const weekB = parseInt(b.name.split('_')[1], 10)
          return weekB - weekA
        })

      for (const weekDir of weekFolders) {
        const weekPath = path.join(yearPath, weekDir.name)
        const { label, dateRange } = parseWeekName(weekDir.name)

        // Count artifacts and categories
        let artifactCount = 0
        let commitCount = 0
        let captureCount = 0
        const categories: string[] = []
        const categoryStats: Record<string, number> = {}

        const categoryFolders = fs.readdirSync(weekPath, { withFileTypes: true })
          .filter(d => d.isDirectory() && /^\d+-/.test(d.name))

        for (const catDir of categoryFolders) {
          const catPath = path.join(weekPath, catDir.name)
          const catName = catDir.name.replace(/^\d+-/, '').replace('_', ' ')

          const files = fs.readdirSync(catPath)
          const mdFiles = files.filter(f => f.endsWith('.md'))

          if (mdFiles.length > 0) {
            categories.push(catName)
            categoryStats[catName] = mdFiles.length
            artifactCount += mdFiles.length

            // Check each markdown file to classify as commit or capture
            for (const mdFile of mdFiles) {
              try {
                const content = fs.readFileSync(path.join(catPath, mdFile), 'utf8')
                if (content.includes('*This artifact was automatically generated from a Git commit.*')) {
                  commitCount++
                } else {
                  captureCount++
                }
              } catch {
                // If we can't read the file, count as capture
                captureCount++
              }
            }
          }
        }

        // Read week summary
        const summary = readWeekSummary(weekPath)

        // Update stats with calculated values
        summary.stats = {
          commits: commitCount,
          screenshots: captureCount,
          ideas: 0,
          topCategory: Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '',
        }

        weeks.push({
          id: `week-${year}-${weekDir.name}`,
          label,
          dateRange,
          year,
          artifactCount,
          categories,
          summary,
          threadCount: 0, // Would need chat storage to count
        })
      }
    }

    return { success: true, weeks }
  } catch (err) {
    console.error('[Weeks] Error scanning folder:', err)
    return { success: false, error: (err as Error).message }
  }
}

// Register custom protocol for serving artifact images
export function registerArtifactProtocol(): void {
  protocol.handle('artifact-file', async (request) => {
    const filePath = decodeURIComponent(request.url.replace('artifact-file://', ''));
    console.log('[Protocol] Loading artifact file:', filePath);

    try {
      const response = await net.fetch(`file://${filePath}`);
      console.log('[Protocol] File loaded successfully:', filePath);
      return response;
    } catch (err) {
      console.error('[Protocol] Failed to load file:', filePath, err);
      throw err;
    }
  });
}

// Register all IPC handlers
export function registerIPCHandlers(): void {
  // Scan for git repositories
  ipcMain.handle('scan-git-repos', async (): Promise<GitRepository[]> => {
    const homeDir = os.homedir();
    const repos: GitRepository[] = [];

    console.log('[IPC] Scanning for git repos in:', homeDir);
    const startTime = Date.now();

    await scanGitReposRecursive(homeDir, repos, 4);

    console.log(`[IPC] Found ${repos.length} repos in ${Date.now() - startTime}ms`);

    // Sort by name
    return repos.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Get hook status for a specific repo
  ipcMain.handle('get-hook-status', async (_event, repoPath: string): Promise<{ installed: boolean; path: string }> => {
    return {
      installed: checkHookInstalled(repoPath),
      path: repoPath,
    };
  });

  // Install git hook
  ipcMain.handle('install-git-hook', async (_event, repoPath: string) => {
    console.log('[IPC] Installing git hook to:', repoPath);
    return installGitHook(repoPath);
  });

  // Remove git hook
  ipcMain.handle('remove-git-hook', async (_event, repoPath: string) => {
    console.log('[IPC] Removing git hook from:', repoPath);
    return removeGitHook(repoPath);
  });

  // Setup macOS Folder Action
  ipcMain.handle('setup-folder-action', async () => {
    console.log('[IPC] Setting up Folder Action');
    return setupFolderAction();
  });

  // Get Mastra server status
  ipcMain.handle('get-mastra-status', async (): Promise<{ running: boolean; port: number }> => {
    const running = await checkMastraRunning();
    return {
      running,
      port: getMastraPort(),
    };
  });

  // Select folder dialog
  ipcMain.handle('select-folder', async (): Promise<{ success: boolean; path?: string; error?: string }> => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      const result = await dialog.showOpenDialog(focusedWindow!, {
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select Artifacts Folder',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'No folder selected' };
      }

      const selectedPath = result.filePaths[0];
      // Save to config
      saveConfig({ artifactsFolder: selectedPath });
      return { success: true, path: selectedPath };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // Get configuration
  ipcMain.handle('get-config', async () => {
    return loadConfig();
  });

  // Save configuration
  ipcMain.handle('save-config', async (_event, config: Partial<AppConfig>) => {
    return saveConfig(config);
  });

  // Save API key
  ipcMain.handle('save-api-key', async (_event, apiKey: string) => {
    console.log('[IPC] Saving API key');
    return saveConfig({ apiKey });
  });

  // Reset configuration (development only)
  ipcMain.handle('reset-config', async () => {
    console.log('[IPC] Resetting configuration');
    const configPath = getConfigPath();
    try {
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // Check folder action status
  ipcMain.handle('get-folder-action-status', async (): Promise<{ installed: boolean }> => {
    if (process.platform !== 'darwin') {
      return { installed: false };
    }
    const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.artifacts.desktopwatcher.plist');
    return { installed: fs.existsSync(plistPath) };
  });

  // Remove folder action
  ipcMain.handle('remove-folder-action', async (): Promise<{ success: boolean; error?: string }> => {
    if (process.platform !== 'darwin') {
      return { success: false, error: 'Folder Actions are only supported on macOS' };
    }

    try {
      const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.artifacts.desktopwatcher.plist');

      if (fs.existsSync(plistPath)) {
        // Unload the launch agent
        try {
          execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' });
        } catch {
          // Ignore unload errors
        }

        // Remove the plist file
        fs.unlinkSync(plistPath);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  // Get artifacts and folder tree
  ipcMain.handle('get-artifacts', async (): Promise<ArtifactsResult> => {
    console.log('[IPC] Getting artifacts');
    return scanArtifactsFolder();
  });

  // Get weeks for contextualize
  ipcMain.handle('get-weeks', async (): Promise<WeeksResult> => {
    console.log('[IPC] Getting weeks');
    return scanWeeksFolder();
  });

  // Get a single week by ID
  ipcMain.handle('get-week-by-id', async (_event, weekId: string): Promise<{ success: boolean; week?: Week; error?: string }> => {
    console.log('[IPC] Getting week by ID:', weekId);
    const result = await scanWeeksFolder();
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const week = result.weeks?.find(w => w.id === weekId);
    if (!week) {
      return { success: false, error: 'Week not found' };
    }
    return { success: true, week };
  });
}
