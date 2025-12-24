import { spawn, ChildProcess } from 'child_process';
import { app } from 'electron';
import * as path from 'path';
import * as http from 'http';
import * as os from 'os';
import * as fs from 'fs';
import { mastraLogger as log } from './logger';

const isDev = process.env.NODE_ENV === 'production' ? false : !app.isPackaged;

// Load configuration for env vars
function loadMastraConfig(): { apiKey: string; artifactsFolder: string } {
  const configPath = path.join(os.homedir(), '.artifact-engine', 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(data);
      return {
        apiKey: config.apiKey || '',
        artifactsFolder: config.artifactsFolder || '',
      };
    }
  } catch (err) {
    log.error({ err }, 'Failed to load config');
  }
  return { apiKey: '', artifactsFolder: '' };
}

// Get the path to the bundled Node.js binary (for production)
function getNodePath(): string {
  if (isDev) {
    return 'node'; // Use system node in development
  }
  // In production, use the bundled Node.js binary
  const nodeBinPath = path.join(process.resourcesPath, 'node', 'bin', 'node');
  log.info({ nodeBinPath }, 'Using bundled Node.js');
  return nodeBinPath;
}

// Get the path to the Mastra server directory
function getMastraServerPath(): string {
  if (isDev) {
    // In dev mode, use the project root for npm run dev
    return path.join(__dirname, '..', '..', '..', '..');
  }
  // In production, use the bundled Mastra output
  return path.join(process.resourcesPath, 'mastra');
}

let mastraProcess: ChildProcess | null = null;
const MASTRA_PORT = 6700;

export function getMastraPort(): number {
  return MASTRA_PORT;
}

export function checkMastraRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${MASTRA_PORT}`, () => {
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

export function startMastraServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const homeDir = os.homedir();
    const desktopPath = path.join(homeDir, 'Desktop');

    // Load config for API key and artifacts folder
    const config = loadMastraConfig();

    // Ensure the mastra store directory exists
    const mastraStoreDir = path.join(homeDir, '.artifact-engine', 'store');
    if (!fs.existsSync(mastraStoreDir)) {
      fs.mkdirSync(mastraStoreDir, { recursive: true });
    }

    // Build environment variables for Mastra
    const mastraEnv = {
      ...process.env,
      PORT: String(MASTRA_PORT),
      MASTRA_DB_PATH: `file:${path.join(mastraStoreDir, 'mastra.db')}`,
      TARGET_PATH: config.artifactsFolder || path.join(homeDir, '.artifact-engine', 'artifacts'),
      DESKTOP_PATH: desktopPath,
      CONTAINER_DESKTOP_PATH: desktopPath, // Same as DESKTOP_PATH when not in Docker
      OPENAI_API_KEY: config.apiKey,
    };

    log.info({
      PORT: mastraEnv.PORT,
      MASTRA_DB_PATH: mastraEnv.MASTRA_DB_PATH,
      TARGET_PATH: mastraEnv.TARGET_PATH,
      DESKTOP_PATH: mastraEnv.DESKTOP_PATH,
      CONTAINER_DESKTOP_PATH: mastraEnv.CONTAINER_DESKTOP_PATH,
    }, 'Environment configured');

    if (isDev) {
      // Development mode: use npm run dev
      const projectRoot = getMastraServerPath();
      log.info({ projectRoot }, 'Starting dev server');

      mastraProcess = spawn('npm', ['run', 'dev'], {
        cwd: projectRoot,
        shell: true,
        env: mastraEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } else {
      // Production mode: run bundled Mastra server with bundled Node
      const nodePath = getNodePath();
      const mastraPath = getMastraServerPath();
      const indexPath = path.join(mastraPath, 'index.mjs');
      const instrumentationPath = path.join(mastraPath, 'instrumentation.mjs');

      log.info({ nodePath, mastraPath, indexPath }, 'Starting production server');

      // Check if files exist
      if (!fs.existsSync(nodePath)) {
        reject(new Error(`Node binary not found at: ${nodePath}`));
        return;
      }
      if (!fs.existsSync(indexPath)) {
        reject(new Error(`Mastra index.mjs not found at: ${indexPath}`));
        return;
      }

      mastraProcess = spawn(nodePath, [
        `--import=${instrumentationPath}`,
        indexPath
      ], {
        cwd: mastraPath,
        env: mastraEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    }

    let resolved = false;

    mastraProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        log.debug(output);
      }

      // Check if Mastra is ready (look for port binding message)
      if (!resolved && (output.includes('6700') || output.includes('ready') || output.includes('listening'))) {
        resolved = true;
        resolve();
      }
    });

    mastraProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        log.error(output);
      }
    });

    mastraProcess.on('error', (err) => {
      log.error({ err }, 'Failed to start server');
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    mastraProcess.on('exit', (code) => {
      log.info({ code }, 'Server process exited');
      mastraProcess = null;
    });

    // Fallback timeout - assume started after 15 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        log.warn('Startup timeout reached, assuming ready');
        resolve();
      }
    }, 15000);
  });
}

export function stopMastraServer(): void {
  if (mastraProcess) {
    log.info('Stopping server...');
    mastraProcess.kill('SIGTERM');
    mastraProcess = null;
  }
}

export function isMastraRunning(): boolean {
  return mastraProcess !== null;
}

export async function restartMastraServer(): Promise<void> {
  log.info('Restarting server...');
  stopMastraServer();

  // Wait a moment for the process to fully terminate
  await new Promise(resolve => setTimeout(resolve, 1000));

  await startMastraServer();
  log.info('Server restarted');
}
