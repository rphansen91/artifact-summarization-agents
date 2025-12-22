import { app, BrowserWindow, shell, protocol } from 'electron';
import * as path from 'path';
import { startMastraServer, stopMastraServer, checkMastraRunning } from './mastra';
import { registerIPCHandlers, registerArtifactProtocol } from './ipc-handlers';

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

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;

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
  console.log('Starting Artifact Engine...');
  console.log('Running in', isDev ? 'development' : 'production', 'mode');

  // Set app name (needed for dev mode to show correct name in dock/menu)
  app.setName('Artifact Engine');

  // Set dock icon on macOS (needed for dev mode)
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'png', '512x512.png');
    app.dock.setIcon(iconPath);
  }

  // Register custom protocol for artifact images
  registerArtifactProtocol();

  // Register IPC handlers
  registerIPCHandlers();

  try {
    // Check if Mastra is already running
    const mastraRunning = await checkMastraRunning();

    if (mastraRunning) {
      console.log('Mastra server already running on port 6700');
    } else {
      console.log('Starting Mastra server...');
      await startMastraServer();
      console.log('Mastra server started');
    }
  } catch (err) {
    console.error('Failed to start Mastra server:', err);
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
  cleanup();
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
