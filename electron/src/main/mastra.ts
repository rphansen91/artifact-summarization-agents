import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';

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

    console.log('[Mastra] Starting server from:', projectRoot);

    mastraProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      shell: true,
      env: { ...process.env },
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
