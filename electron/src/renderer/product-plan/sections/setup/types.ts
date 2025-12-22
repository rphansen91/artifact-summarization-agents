// =============================================================================
// Data Types
// =============================================================================

export type Platform = 'mac' | 'windows' | 'linux'

export type WorkflowType = 'screenshot' | 'git-hook'

export interface SetupConfig {
  artifactsFolder: string
  artifactsFolderSet: boolean
  apiKey: string
  apiKeySet: boolean
  automationInstalled: boolean
  automationPlatform: Platform
  currentStep: number
  isComplete: boolean
}

export interface SetupStep {
  id: string
  stepNumber: number
  title: string
  description: string
  isComplete: boolean
  isActive: boolean
}

export interface Repository {
  id: string
  name: string
  path: string
  isConnected: boolean
  lastCommitDate: string
  commitCount: number
}

export interface Workflow {
  id: string
  name: string
  type: WorkflowType
  description: string
  isInstalled: boolean
  shortcut?: string
  connectedRepos?: number
  platform: Platform | 'cross-platform'
}

// =============================================================================
// Component Props
// =============================================================================

export interface SetupProps {
  /** Current setup configuration state */
  config: SetupConfig
  /** The wizard steps */
  steps: SetupStep[]
  /** Available and connected repositories */
  repositories: Repository[]
  /** Available workflows/automations */
  workflows: Workflow[]

  /** Called when user selects an artifacts folder */
  onSelectFolder?: () => void
  /** Called when the artifacts folder path changes */
  onFolderChange?: (path: string) => void
  /** Called when user saves their API key */
  onSaveApiKey?: (apiKey: string) => void
  /** Called when user installs the screenshot automation */
  onInstallAutomation?: () => void
  /** Called when user uninstalls the screenshot automation */
  onUninstallAutomation?: () => void
  /** Called when user connects a repository */
  onConnectRepo?: (repoId: string) => void
  /** Called when user disconnects a repository */
  onDisconnectRepo?: (repoId: string) => void
  /** Called when user browses to add a new repository */
  onBrowseRepo?: () => void
  /** Called when user navigates to a specific step */
  onGoToStep?: (stepNumber: number) => void
  /** Called when user advances to the next step */
  onNextStep?: () => void
  /** Called when user goes back to the previous step */
  onPrevStep?: () => void
  /** Called when user completes setup */
  onComplete?: () => void
}
