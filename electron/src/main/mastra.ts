import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';
import * as os from 'os';
import * as fs from 'fs';

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
    console.error('[Mastra] Failed to load config:', err);
  }
  return { apiKey: '', artifactsFolder: '' };
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
    // Project root is four levels up from electron/dist/main/main/
    const projectRoot = path.join(__dirname, '..', '..', '..', '..');
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

    console.log('[Mastra] Starting server from:', projectRoot);
    console.log('[Mastra] Environment:', {
      PORT: mastraEnv.PORT,
      MASTRA_DB_PATH: mastraEnv.MASTRA_DB_PATH,
      TARGET_PATH: mastraEnv.TARGET_PATH,
      DESKTOP_PATH: mastraEnv.DESKTOP_PATH,
      CONTAINER_DESKTOP_PATH: mastraEnv.CONTAINER_DESKTOP_PATH,
    });

    mastraProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      shell: true,
      env: mastraEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let resolved = false;

    mastraProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log('[Mastra]', output);

      // Check if Mastra is ready (look for port binding message)
      if (!resolved && (output.includes('6700') || output.includes('ready') || output.includes('listening'))) {
        resolved = true;
        resolve();
      }
    });

    mastraProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[Mastra Error]', data.toString());
    });

    mastraProcess.on('error', (err) => {
      console.error('[Mastra] Failed to start:', err);
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    mastraProcess.on('exit', (code) => {
      console.log('[Mastra] Process exited with code:', code);
      mastraProcess = null;
    });

    // Fallback timeout - assume started after 15 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('[Mastra] Startup timeout reached, assuming ready');
        resolve();
      }
    }, 15000);
  });
}

export function stopMastraServer(): void {
  if (mastraProcess) {
    console.log('[Mastra] Stopping server...');
    mastraProcess.kill('SIGTERM');
    mastraProcess = null;
  }
}

export function isMastraRunning(): boolean {
  return mastraProcess !== null;
}

export async function restartMastraServer(): Promise<void> {
  console.log('[Mastra] Restarting server...');
  stopMastraServer();

  // Wait a moment for the process to fully terminate
  await new Promise(resolve => setTimeout(resolve, 1000));

  await startMastraServer();
  console.log('[Mastra] Server restarted');
}
