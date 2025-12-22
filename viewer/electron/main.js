const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let nextProcess;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Artifact Viewer',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0a0a0f',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load the app
  const appUrl = `http://localhost:${PORT}`;
  mainWindow.loadURL(appUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const nextDir = path.join(__dirname, '..');

    // Start Next.js dev server
    nextProcess = spawn('npm', ['run', 'dev'], {
      cwd: nextDir,
      shell: true,
      env: { ...process.env, PORT: PORT.toString() },
    });

    nextProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output);

      // Check if Next.js is ready
      if (output.includes('Ready') || output.includes(`localhost:${PORT}`)) {
        resolve();
      }
    });

    nextProcess.stderr.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js:', err);
      reject(err);
    });

    // Fallback timeout - assume server started after 10 seconds
    setTimeout(() => {
      resolve();
    }, 10000);
  });
}

function cleanup() {
  if (nextProcess) {
    console.log('Stopping Next.js server...');
    nextProcess.kill('SIGTERM');
    nextProcess = null;
  }
}

app.whenReady().then(async () => {
  console.log('Starting Artifact Viewer...');

  try {
    // Check if Next.js server is already running (e.g., started by concurrently)
    const serverRunning = await checkServerRunning();

    if (serverRunning) {
      console.log('Next.js server already running, skipping server start...');
    } else {
      console.log('Starting Next.js server...');
      await startNextServer();
    }

    createWindow();
  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }

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
