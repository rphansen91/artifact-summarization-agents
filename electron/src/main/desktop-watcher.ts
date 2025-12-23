import { BrowserWindow, ipcMain, app } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

let watcher: fs.FSWatcher | null = null;
let isEnabled = false;
const processedFiles = new Set<string>();
let debounceTimer: NodeJS.Timeout | null = null;
let dialogWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

// Check if a file is a screenshot based on name
function isScreenshot(filename: string): boolean {
  return (
    (filename.startsWith('Screenshot') || filename.startsWith('Screen Shot')) &&
    filename.endsWith('.png')
  );
}

// Show custom dialog window for screenshot
function showScreenshotDialog(filePath: string): Promise<{ action: string; notes: string }> {
  return new Promise((resolve) => {
    const filename = path.basename(filePath);

    // Close existing dialog if open
    if (dialogWindow && !dialogWindow.isDestroyed()) {
      dialogWindow.destroy();
      dialogWindow = null;
    }

    dialogWindow = new BrowserWindow({
      width: 400,
      height: 300,
      show: false, // Don't show until sized
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      frame: true,
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 12, y: 12 },
      vibrancy: 'window',
      webPreferences: {
        preload: path.join(__dirname, '..', 'preload', 'index.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const currentWindow = dialogWindow;

    // Resize and show window once content is ready
    currentWindow.webContents.on('did-finish-load', () => {
      setTimeout(() => {
        if (currentWindow && !currentWindow.isDestroyed()) {
          currentWindow.webContents.executeJavaScript(`
            document.getElementById('root').offsetHeight
          `).then((height: number) => {
            if (currentWindow && !currentWindow.isDestroyed()) {
              const finalHeight = Math.min(Math.max(height, 300), 600);
              currentWindow.setContentSize(400, finalHeight);
              currentWindow.center();
              currentWindow.show();
            }
          }).catch(() => {
            if (currentWindow && !currentWindow.isDestroyed()) {
              currentWindow.show();
            }
          });
        }
      }, 100);
    });

    // Handle result from dialog
    const handleResult = (
      _event: Electron.IpcMainEvent,
      result: { action: string; notes: string; imagePath: string }
    ) => {
      if (result.imagePath === filePath) {
        ipcMain.removeListener('screenshot-dialog-result', handleResult);
        if (dialogWindow && !dialogWindow.isDestroyed()) {
          dialogWindow.close();
        }
        dialogWindow = null;
        resolve({ action: result.action, notes: result.notes });
      }
    };

    ipcMain.on('screenshot-dialog-result', handleResult);

    // Handle window close without response
    dialogWindow.on('closed', () => {
      ipcMain.removeListener('screenshot-dialog-result', handleResult);
      dialogWindow = null;
      resolve({ action: 'skip', notes: '' });
    });

    // Load the dialog
    const params = new URLSearchParams({
      imagePath: filePath,
      filename: filename,
    });

    if (isDev) {
      dialogWindow.loadURL(`http://localhost:5173/screenshot-dialog.html?${params}`);
    } else {
      dialogWindow.loadFile(
        path.join(__dirname, '..', '..', 'renderer', 'screenshot-dialog.html'),
        { query: { imagePath: filePath, filename: filename } }
      );
    }
  });
}

// Process the screenshot
async function processScreenshot(filePath: string): Promise<void> {
  // Skip if already processed
  if (processedFiles.has(filePath)) {
    console.log('[DesktopWatcher] Already processed:', filePath);
    return;
  }

  // Mark as processed immediately to prevent duplicates
  processedFiles.add(filePath);

  // Keep the set from growing too large
  if (processedFiles.size > 100) {
    const entries = Array.from(processedFiles);
    entries.slice(0, 50).forEach((f) => processedFiles.delete(f));
  }

  console.log('[DesktopWatcher] New screenshot detected:', filePath);

  // Wait a moment for the file to be fully written
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify file still exists
  if (!fs.existsSync(filePath)) {
    console.log('[DesktopWatcher] File no longer exists:', filePath);
    return;
  }

  try {
    // Show custom dialog
    const { action, notes } = await showScreenshotDialog(filePath);

    if (action === 'skip') {
      console.log('[DesktopWatcher] User skipped screenshot');
      return;
    }

    // Call the workflow API
    const payload = {
      inputData: {
        image_path: filePath,
        notes: notes,
      },
    };

    console.log('[DesktopWatcher] Calling workflow API...');
    const response = await fetch(
      'http://localhost:6700/api/workflows/autoArtifactAnalysisWorkflow/start-async',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as { status?: string };
    console.log('[DesktopWatcher] API response:', data);

    if (data.status === 'success') {
      console.log('[DesktopWatcher] Screenshot processed successfully!');
    } else {
      console.log('[DesktopWatcher] Processing failed:', data);
    }
  } catch (err) {
    console.error('[DesktopWatcher] Error processing screenshot:', err);
  }
}

// Scan for new screenshots (debounced)
function scanForNewScreenshots(desktopPath: string): void {
  // Debounce - wait for filesystem to settle
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    try {
      const files = fs.readdirSync(desktopPath);
      const now = Date.now();

      for (const file of files) {
        if (!isScreenshot(file)) continue;

        const filePath = path.join(desktopPath, file);

        // Skip already processed
        if (processedFiles.has(filePath)) continue;

        try {
          const stats = fs.statSync(filePath);
          // Only process files created in the last 30 seconds
          if (now - stats.mtimeMs < 30000) {
            processScreenshot(filePath);
            break; // Process one at a time
          }
        } catch {
          // File may have been deleted
        }
      }
    } catch (err) {
      console.error('[DesktopWatcher] Error scanning:', err);
    }
  }, 500);
}

// Start watching the Desktop folder
export function startDesktopWatcher(): void {
  if (watcher) {
    console.log('[DesktopWatcher] Already running');
    return;
  }

  const desktopPath = path.join(os.homedir(), 'Desktop');
  console.log('[DesktopWatcher] Starting watcher on:', desktopPath);

  try {
    watcher = fs.watch(desktopPath, { persistent: true }, (eventType, filename) => {
      if (!isEnabled) return;
      if (!filename) return;

      console.log('[DesktopWatcher] Event:', eventType, filename);

      if (eventType === 'rename' && isScreenshot(filename)) {
        // 'rename' is triggered for new files on macOS
        const filePath = path.join(desktopPath, filename);

        // Check if file exists (rename is also triggered for deletes)
        if (fs.existsSync(filePath)) {
          scanForNewScreenshots(desktopPath);
        }
      }
    });

    watcher.on('error', (error) => {
      console.error('[DesktopWatcher] Error:', error);
    });

    console.log('[DesktopWatcher] Ready and watching');
    isEnabled = true;
  } catch (err) {
    console.error('[DesktopWatcher] Failed to start:', err);
    throw err;
  }
}

// Stop watching
export function stopDesktopWatcher(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
    isEnabled = false;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (dialogWindow && !dialogWindow.isDestroyed()) {
      dialogWindow.close();
      dialogWindow = null;
    }
    console.log('[DesktopWatcher] Stopped');
  }
}

// Check if watcher is running
export function isDesktopWatcherRunning(): boolean {
  return watcher !== null && isEnabled;
}

// Enable/disable processing (watcher still runs but doesn't process)
export function setDesktopWatcherEnabled(enabled: boolean): void {
  isEnabled = enabled;
  console.log('[DesktopWatcher] Enabled:', enabled);
}
