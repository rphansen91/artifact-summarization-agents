import { BrowserWindow, ipcMain, app } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { watcherLogger as log } from './logger';

let watcher: fs.FSWatcher | null = null;
let isEnabled = false;
const processedFiles = new Set<string>();
let debounceTimer: NodeJS.Timeout | null = null;
let dialogWindow: BrowserWindow | null = null;


const isDev = process.env.NODE_ENV === 'production' ? false : !app.isPackaged;

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
    log.debug({ filePath }, 'Already processed');
    return;
  }

  // Mark as processed immediately to prevent duplicates
  processedFiles.add(filePath);

  // Keep the set from growing too large
  if (processedFiles.size > 100) {
    const entries = Array.from(processedFiles);
    entries.slice(0, 50).forEach((f) => processedFiles.delete(f));
  }

  log.info({ filePath }, 'New screenshot detected');

  // Wait a moment for the file to be fully written
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify file still exists
  if (!fs.existsSync(filePath)) {
    log.warn({ filePath }, 'File no longer exists');
    return;
  }

  try {
    // Show custom dialog
    const { action, notes } = await showScreenshotDialog(filePath);

    if (action === 'skip') {
      log.info('User skipped screenshot');
      return;
    }

    // Call the workflow API
    const payload = {
      inputData: {
        image_path: filePath,
        notes: notes,
      },
    };

    log.info('Calling workflow API...');
    const response = await fetch(
      'http://localhost:6700/api/workflows/autoArtifactAnalysisWorkflow/start-async',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as { status?: string };
    log.debug({ data }, 'API response');

    if (data.status === 'success') {
      log.info('Screenshot processed successfully');
    } else {
      log.warn({ data }, 'Processing failed');
    }
  } catch (err) {
    log.error({ err }, 'Error processing screenshot');
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
      log.error({ err }, 'Error scanning');
    }
  }, 500);
}

// Start watching the Desktop folder
export function startDesktopWatcher(): void {
  if (watcher) {
    log.info('Already running');
    return;
  }

  const desktopPath = path.join(os.homedir(), 'Desktop');
  log.info({ desktopPath }, 'Starting watcher');

  try {
    watcher = fs.watch(desktopPath, { persistent: true }, (eventType, filename) => {
      if (!isEnabled) return;
      if (!filename) return;

      log.debug({ eventType, filename }, 'File event');

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
      log.error({ error }, 'Watcher error');
    });

    log.info('Ready and watching');
    isEnabled = true;
  } catch (err) {
    log.error({ err }, 'Failed to start');
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
    log.info('Stopped');
  }
}

// Check if watcher is running
export function isDesktopWatcherRunning(): boolean {
  return watcher !== null && isEnabled;
}

// Enable/disable processing (watcher still runs but doesn't process)
export function setDesktopWatcherEnabled(enabled: boolean): void {
  isEnabled = enabled;
  log.info({ enabled }, 'Enabled state changed');
}
