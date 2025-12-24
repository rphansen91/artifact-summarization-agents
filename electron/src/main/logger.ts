import log from 'electron-log';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Configure log directory
const logsDir = path.join(os.homedir(), '.artifact-engine', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure electron-log
log.transports.file.resolvePathFn = () => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `main-${date}.log`);
};

// Set log level
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

// Format for file output
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

// Format for console output
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

// Log startup info
log.info('Logger initialized', { logsDir });

// Create scoped loggers for different modules
function createScopedLogger(scope: string) {
  return {
    info: (msgOrObj: string | object, msg?: string) => {
      if (typeof msgOrObj === 'string') {
        log.info(`[${scope}] ${msgOrObj}`);
      } else {
        log.info(`[${scope}] ${msg || ''}`, msgOrObj);
      }
    },
    debug: (msgOrObj: string | object, msg?: string) => {
      if (typeof msgOrObj === 'string') {
        log.debug(`[${scope}] ${msgOrObj}`);
      } else {
        log.debug(`[${scope}] ${msg || ''}`, msgOrObj);
      }
    },
    warn: (msgOrObj: string | object, msg?: string) => {
      if (typeof msgOrObj === 'string') {
        log.warn(`[${scope}] ${msgOrObj}`);
      } else {
        log.warn(`[${scope}] ${msg || ''}`, msgOrObj);
      }
    },
    error: (msgOrObj: string | object, msg?: string) => {
      if (typeof msgOrObj === 'string') {
        log.error(`[${scope}] ${msgOrObj}`);
      } else {
        log.error(`[${scope}] ${msg || ''}`, msgOrObj);
      }
    },
  };
}

export const mainLogger = createScopedLogger('main');
export const mastraLogger = createScopedLogger('mastra');
export const ipcLogger = createScopedLogger('ipc');
export const watcherLogger = createScopedLogger('watcher');

// Export the base logger as default
export default log;

// Helper to get the logs directory path
export function getLogsDirectory(): string {
  return logsDir;
}

// Clean up old log files (keep last 7 days)
export function cleanOldLogs(daysToKeep: number = 7): void {
  try {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('main-') || !file.endsWith('.log')) continue;

      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        log.debug('Deleted old log file', { file });
      }
    }
  } catch (err) {
    log.error('Failed to clean old logs', { err });
  }
}
