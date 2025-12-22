export interface GitRepository {
  name: string;
  path: string;
  hasHook: boolean;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  path?: string;
}

// Browse types
export interface FolderNode {
  id: string;
  name: string;
  type: 'year' | 'week' | 'category';
  isExpanded?: boolean;
  itemCount?: number;
  children?: FolderNode[];
}

export interface Artifact {
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

export interface ArtifactsResult {
  success: boolean;
  folderTree?: FolderNode[];
  artifacts?: Artifact[];
  error?: string;
}

// Contextualize types
export interface WeekStats {
  commits: number;
  screenshots: number;
  ideas: number;
  topCategory: string;
}

export interface WeekSummary {
  status: 'pending' | 'generating' | 'generated';
  generatedAt: string | null;
  narrative: string | null;
  highlights: string[];
  stats: WeekStats;
}

export interface Week {
  id: string;
  label: string;
  dateRange: string;
  year: number;
  artifactCount: number;
  categories: string[];
  summary: WeekSummary;
  threadCount: number;
}

export interface WeeksResult {
  success: boolean;
  weeks?: Week[];
  error?: string;
}

export interface MastraStatus {
  running: boolean;
  port: number;
}

export interface AppConfig {
  artifactsFolder: string;
  apiKey: string;
  setupComplete: boolean;
}

export interface ElectronAPI {
  platform: string;

  // Git repository management
  scanGitRepos: () => Promise<GitRepository[]>;
  getHookStatus: (repoPath: string) => Promise<{ installed: boolean; path: string }>;
  installGitHook: (repoPath: string) => Promise<OperationResult>;
  removeGitHook: (repoPath: string) => Promise<OperationResult>;

  // macOS automation
  setupFolderAction: () => Promise<OperationResult>;
  getFolderActionStatus: () => Promise<{ installed: boolean }>;
  removeFolderAction: () => Promise<OperationResult>;

  // Server status
  getMastraStatus: () => Promise<MastraStatus>;

  // Configuration
  selectFolder: () => Promise<OperationResult>;
  getConfig: () => Promise<AppConfig>;
  saveConfig: (config: Partial<AppConfig>) => Promise<OperationResult>;
  saveApiKey: (apiKey: string) => Promise<OperationResult>;
  resetConfig: () => Promise<OperationResult>;

  // Artifacts
  getArtifacts: () => Promise<ArtifactsResult>;

  // Contextualize
  getWeeks: () => Promise<WeeksResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
