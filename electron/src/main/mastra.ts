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
    const req = http.get(`http://localhost:${MASTRA_PORT}/health`, (res) => {
      // Consider it running if we get a 2xx response
      resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Polls the Mastra health endpoint until it responds successfully
 * @param maxAttempts Maximum number of polling attempts
 * @param intervalMs Time between polling attempts in milliseconds
 */
export function waitForMastraReady(maxAttempts = 30, intervalMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;

    const poll = () => {
      attempts++;
      log.debug({ attempt: attempts, maxAttempts }, 'Checking Mastra health');

      const req = http.get(`http://localhost:${MASTRA_PORT}/health`, (res) => {
        if (res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300) {
          log.info({ attempts }, 'Mastra server is ready');
          resolve(true);
        } else {
          scheduleNextAttempt();
        }
      });

      req.on('error', () => {
        scheduleNextAttempt();
      });

      req.setTimeout(2000, () => {
        req.destroy();
        scheduleNextAttempt();
      });
    };

    const scheduleNextAttempt = () => {
      if (attempts >= maxAttempts) {
        log.warn({ attempts }, 'Mastra server failed to become ready within timeout');
        resolve(false);
      } else {
        setTimeout(poll, intervalMs);
      }
    };

    poll();
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

    // Log stdout for debugging
    mastraProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        log.debug(output);
      }
    });

    // Log stderr for debugging
    mastraProcess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString().trim();
      if (output) {
        log.error(output);
      }
    });

    mastraProcess.on('error', (err) => {
      log.error({ err }, 'Failed to start server');
      reject(err);
    });

    mastraProcess.on('exit', (code) => {
      log.info({ code }, 'Server process exited');
      mastraProcess = null;
    });

    // Wait for the server to be ready by polling the health endpoint
    log.info('Waiting for Mastra server to become ready...');
    waitForMastraReady(30, 500).then((ready) => {
      if (ready) {
        log.info('Mastra server is now accepting requests');
        resolve();
      } else {
        reject(new Error('Mastra server failed to become ready within timeout'));
      }
    });
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
