import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for the exposed API
export interface GitRepository {
  name: string;
  path: string;
  hasHook: boolean;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  path?: string;
}

export interface MastraStatus {
  running: boolean;
  port: number;
}

export interface AppConfig {
  artifactsFolder: string;
  apiKey: string;
  setupComplete: boolean;
}

// Browse types
export interface FolderNode {
  id: string;
  name: string;
  type: 'year' | 'week' | 'category';
  isExpanded?: boolean;
  itemCount?: number;
  children?: FolderNode[];
}

export interface Artifact {
  id: string;
  name: string;
  title: string;
  categoryId: string;
  weekId: string;
  weekName: string;
  categoryName: string;
  imagePath: string;
  markdownPath: string;
  markdownContent: string;
  fileTypes: string[];
  createdAt: string;
}

export interface ArtifactsResult {
  success: boolean;
  folderTree?: FolderNode[];
  artifacts?: Artifact[];
  error?: string;
}

// Contextualize types
export interface WeekStats {
  commits: number;
  screenshots: number;
  ideas: number;
  topCategory: string;
}

export interface WeekSummary {
  status: 'pending' | 'generating' | 'generated';
  generatedAt: string | null;
  narrative: string | null;
  highlights: string[];
  stats: WeekStats;
}

export interface Week {
  id: string;
  label: string;
  dateRange: string;
  year: number;
  artifactCount: number;
  categories: string[];
  summary: WeekSummary;
  threadCount: number;
}

export interface WeeksResult {
  success: boolean;
  weeks?: Week[];
  error?: string;
}

export interface ElectronAPI {
  platform: string;

  // Git repository management
  scanGitRepos: () => Promise<GitRepository[]>;
  getHookStatus: (repoPath: string) => Promise<{ installed: boolean; path: string }>;
  installGitHook: (repoPath: string) => Promise<OperationResult>;
  removeGitHook: (repoPath: string) => Promise<OperationResult>;

  // macOS automation
  setupFolderAction: () => Promise<OperationResult>;
  getFolderActionStatus: () => Promise<{ installed: boolean }>;
  removeFolderAction: () => Promise<OperationResult>;

  // Server status
  getMastraStatus: () => Promise<MastraStatus>;

  // Configuration
  selectFolder: () => Promise<OperationResult>;
  getConfig: () => Promise<AppConfig>;
  saveConfig: (config: Partial<AppConfig>) => Promise<OperationResult>;
  saveApiKey: (apiKey: string) => Promise<OperationResult>;
  resetConfig: () => Promise<OperationResult>;

  // Artifacts
  getArtifacts: () => Promise<ArtifactsResult>;

  // Contextualize
  getWeeks: () => Promise<WeeksResult>;
}

// Expose APIs to the renderer process
const electronAPI: ElectronAPI = {
  platform: process.platform,

  // Git repository management
  scanGitRepos: () => ipcRenderer.invoke('scan-git-repos'),
  getHookStatus: (repoPath: string) => ipcRenderer.invoke('get-hook-status', repoPath),
  installGitHook: (repoPath: string) => ipcRenderer.invoke('install-git-hook', repoPath),
  removeGitHook: (repoPath: string) => ipcRenderer.invoke('remove-git-hook', repoPath),

  // macOS automation
  setupFolderAction: () => ipcRenderer.invoke('setup-folder-action'),
  getFolderActionStatus: () => ipcRenderer.invoke('get-folder-action-status'),
  removeFolderAction: () => ipcRenderer.invoke('remove-folder-action'),

  // Server status
  getMastraStatus: () => ipcRenderer.invoke('get-mastra-status'),

  // Configuration
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: Partial<AppConfig>) => ipcRenderer.invoke('save-config', config),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
  resetConfig: () => ipcRenderer.invoke('reset-config'),

  // Artifacts
  getArtifacts: () => ipcRenderer.invoke('get-artifacts'),

  // Contextualize
  getWeeks: () => ipcRenderer.invoke('get-weeks'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
