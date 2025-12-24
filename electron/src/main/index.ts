import { app, BrowserWindow, shell, protocol } from 'electron';
import * as path from 'path';
import { startMastraServer, stopMastraServer, checkMastraRunning, waitForMastraReady } from './mastra';
import { registerIPCHandlers, registerArtifactProtocol, initializeScreenshotAutomation } from './ipc-handlers';
import { mainLogger as log, cleanOldLogs } from './logger';

// Register custom protocol scheme BEFORE app is ready
// This is required for the protocol to work in secure contexts
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'artifact-file',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'production' ? false : !app.isPackaged;

// Set app name early (before ready) for macOS dock tooltip
if (process.platform === 'darwin') {
  app.setName('Artifact Engine');
}

// Get the app icon path based on platform
function getIconPath(): string {
  const resourcesPath = isDev
    ? path.join(__dirname, '..', '..', '..', 'resources')
    : path.join(process.resourcesPath, 'resources');

  if (process.platform === 'win32') {
    return path.join(resourcesPath, 'icons', 'win', 'icon.ico');
  } else if (process.platform === 'darwin') {
    return path.join(resourcesPath, 'icons', 'mac', 'icon.icns');
  } else {
    return path.join(resourcesPath, 'icons', 'png', '512x512.png');
  }
}

function createWindow(): void {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    title: 'Artifact Engine',
    icon: iconPath,
    backgroundColor: '#0a0a0f',
    show: false,
    // Hide the title bar but keep window controls (macOS)
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for preload script to work properly
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load the app
  log.info({ isDev }, 'Loading app');
  if (isDev) {
    // In dev mode, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function cleanup(): void {
  stopMastraServer();
}

app.whenReady().then(async () => {
  log.info('Starting Artifact Engine...');
  log.info({ mode: isDev ? 'development' : 'production' }, 'Running in mode');

  // Clean up old log files on startup
  cleanOldLogs(7);

  // Set dock icon on macOS (needed for dev mode)
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'png', '512x512.png');
    app.dock.setIcon(iconPath);
  }

  // Register custom protocol for artifact images
  registerArtifactProtocol();

  // Register IPC handlers
  registerIPCHandlers();

  // Initialize screenshot automation if previously enabled
  initializeScreenshotAutomation();

  try {
    // Check if Mastra is already running and healthy
    const mastraRunning = await checkMastraRunning();

    if (mastraRunning) {
      log.info('Mastra server already running and healthy on port 6700');
    } else {
      log.info('Starting Mastra server...');
      await startMastraServer();
      log.info('Mastra server started and ready');
    }
  } catch (err) {
    log.error({ err }, 'Failed to start Mastra server');
    // Continue anyway - the app can still function without Mastra for some features
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanup();
});

app.on('will-quit', () => {
  cleanup();
});
