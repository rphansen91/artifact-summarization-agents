import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SetupWizard,
  type SetupConfig,
  type SetupStep,
  type Repository,
  type Workflow,
  type Platform
} from '../components/setup'
import type { GitRepository } from '../types/electron.d'

// Default wizard steps
const defaultSteps: SetupStep[] = [
  {
    id: 'folder',
    stepNumber: 1,
    title: 'Folder',
    description: 'Choose where to store artifacts',
    isComplete: false,
    isActive: true,
  },
  {
    id: 'api-key',
    stepNumber: 2,
    title: 'API Key',
    description: 'Connect your OpenAI API key',
    isComplete: false,
    isActive: false,
  },
  {
    id: 'automation',
    stepNumber: 3,
    title: 'Automation',
    description: 'Set up screenshot capture',
    isComplete: false,
    isActive: false,
  },
  {
    id: 'repos',
    stepNumber: 4,
    title: 'Repos',
    description: 'Connect git repositories',
    isComplete: false,
    isActive: false,
  },
]

// Map platform string to our Platform type
function getPlatform(): Platform {
  const platform = window.electronAPI?.platform ?? 'darwin'
  if (platform === 'darwin') return 'mac'
  if (platform === 'win32') return 'windows'
  return 'linux'
}

export function SetupPage() {
  const navigate = useNavigate()

  // Setup configuration state
  const [config, setConfig] = useState<SetupConfig>({
    artifactsFolder: '',
    artifactsFolderSet: false,
    apiKey: '',
    apiKeySet: false,
    automationInstalled: false,
    automationPlatform: getPlatform(),
    currentStep: 1,
    isComplete: false,
  })

  // Steps state
  const [steps, setSteps] = useState<SetupStep[]>(defaultSteps)

  // Repositories state
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)

  // Workflows state
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'screenshot',
      name: 'Screenshot Capture',
      type: 'screenshot',
      description: 'Capture and analyze screenshots automatically',
      isInstalled: false,
      shortcut: '⌘ + Shift + A',
      platform: getPlatform(),
    },
  ])

  // Load saved configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await window.electronAPI.getConfig()

        setConfig(prev => ({
          ...prev,
          artifactsFolder: savedConfig.artifactsFolder || '',
          artifactsFolderSet: !!savedConfig.artifactsFolder,
          apiKey: savedConfig.apiKey || '',
          apiKeySet: !!savedConfig.apiKey,
        }))

        // Check folder action status
        const folderActionStatus = await window.electronAPI.getFolderActionStatus()
        setWorkflows(prev => prev.map(w =>
          w.type === 'screenshot' ? { ...w, isInstalled: folderActionStatus.installed } : w
        ))
        setConfig(prev => ({ ...prev, automationInstalled: folderActionStatus.installed }))

        // Update steps based on config
        updateStepsFromConfig(savedConfig)
      } catch (err) {
        console.error('Failed to load config:', err)
      }
    }

    loadConfig()
  }, [])

  // Update steps completion state based on config
  const updateStepsFromConfig = useCallback((savedConfig: { artifactsFolder: string; apiKey: string }) => {
    setSteps(prev => prev.map(step => {
      switch (step.id) {
        case 'folder':
          return { ...step, isComplete: !!savedConfig.artifactsFolder }
        case 'api-key':
          return { ...step, isComplete: !!savedConfig.apiKey }
        default:
          return step
      }
    }))
  }, [])

  // Scan for git repositories when reaching step 4
  useEffect(() => {
    if (config.currentStep === 4 && repositories.length === 0 && !isLoadingRepos) {
      scanRepositories()
    }
  }, [config.currentStep, repositories.length, isLoadingRepos])

  // Scan for git repositories
  const scanRepositories = async () => {
    setIsLoadingRepos(true)
    try {
      const repos = await window.electronAPI.scanGitRepos()
      const mappedRepos: Repository[] = repos.map((repo: GitRepository) => ({
        id: repo.path,
        name: repo.name,
        path: repo.path,
        isConnected: repo.hasHook,
        lastCommitDate: new Date().toISOString(), // We don't have this info from the scan
        commitCount: 0, // We don't have this info from the scan
      }))
      setRepositories(mappedRepos)
    } catch (err) {
      console.error('Failed to scan repositories:', err)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  // Handle folder selection
  const handleSelectFolder = async () => {
    try {
      const result = await window.electronAPI.selectFolder()
      if (result.success && result.path) {
        setConfig(prev => ({
          ...prev,
          artifactsFolder: result.path!,
          artifactsFolderSet: true,
        }))
        setSteps(prev => prev.map(step =>
          step.id === 'folder' ? { ...step, isComplete: true } : step
        ))
      }
    } catch (err) {
      console.error('Failed to select folder:', err)
    }
  }

  // Handle API key save
  const handleSaveApiKey = async (apiKey: string) => {
    try {
      const result = await window.electronAPI.saveApiKey(apiKey)
      if (result.success) {
        setConfig(prev => ({
          ...prev,
          apiKey,
          apiKeySet: true,
        }))
        setSteps(prev => prev.map(step =>
          step.id === 'api-key' ? { ...step, isComplete: true } : step
        ))
        // Start Mastra server with the new API key
        const mastraStatus = await window.electronAPI.getMastraStatus()
        if (mastraStatus.running) {
          // Server is already running, restart it to pick up the new key
          await window.electronAPI.restartMastraServer()
        } else {
          // Server is not running, start it
          await window.electronAPI.startMastraServer()
        }
      }
    } catch (err) {
      console.error('Failed to save API key:', err)
    }
  }

  // Handle automation installation
  const handleInstallAutomation = async () => {
    try {
      const result = await window.electronAPI.setupFolderAction()
      if (result.success) {
        setConfig(prev => ({ ...prev, automationInstalled: true }))
        setWorkflows(prev => prev.map(w =>
          w.type === 'screenshot' ? { ...w, isInstalled: true } : w
        ))
        setSteps(prev => prev.map(step =>
          step.id === 'automation' ? { ...step, isComplete: true } : step
        ))
      } else {
        console.error('Failed to install automation:', result.error)
      }
    } catch (err) {
      console.error('Failed to install automation:', err)
    }
  }

  // Handle automation uninstallation
  const handleUninstallAutomation = async () => {
    try {
      const result = await window.electronAPI.removeFolderAction()
      if (result.success) {
        setConfig(prev => ({ ...prev, automationInstalled: false }))
        setWorkflows(prev => prev.map(w =>
          w.type === 'screenshot' ? { ...w, isInstalled: false } : w
        ))
      } else {
        console.error('Failed to uninstall automation:', result.error)
      }
    } catch (err) {
      console.error('Failed to uninstall automation:', err)
    }
  }

  // Handle repository connection
  const handleConnectRepo = async (repoId: string) => {
    try {
      const result = await window.electronAPI.installGitHook(repoId)
      if (result.success) {
        setRepositories(prev => prev.map(repo =>
          repo.id === repoId ? { ...repo, isConnected: true } : repo
        ))
      } else {
        console.error('Failed to connect repo:', result.error)
      }
    } catch (err) {
      console.error('Failed to connect repo:', err)
    }
  }

  // Handle repository disconnection
  const handleDisconnectRepo = async (repoId: string) => {
    try {
      const result = await window.electronAPI.removeGitHook(repoId)
      if (result.success) {
        setRepositories(prev => prev.map(repo =>
          repo.id === repoId ? { ...repo, isConnected: false } : repo
        ))
      } else {
        console.error('Failed to disconnect repo:', result.error)
      }
    } catch (err) {
      console.error('Failed to disconnect repo:', err)
    }
  }

  // Handle browse for new repository
  const handleBrowseRepo = async () => {
    // Re-scan repositories to pick up any new ones
    await scanRepositories()
  }

  // Handle step navigation
  const handleGoToStep = (stepNumber: number) => {
    setConfig(prev => ({ ...prev, currentStep: stepNumber }))
  }

  const handleNextStep = () => {
    if (config.currentStep < steps.length) {
      setConfig(prev => ({ ...prev, currentStep: prev.currentStep + 1 }))
    }
  }

  const handlePrevStep = () => {
    if (config.currentStep > 1) {
      setConfig(prev => ({ ...prev, currentStep: prev.currentStep - 1 }))
    }
  }

  // Handle setup completion
  const handleComplete = async () => {
    try {
      await window.electronAPI.saveConfig({ setupComplete: true })
      setConfig(prev => ({ ...prev, isComplete: true }))
      navigate('/capture')
    } catch (err) {
      console.error('Failed to complete setup:', err)
    }
  }

  return (
    <SetupWizard
      config={config}
      steps={steps}
      repositories={repositories}
      workflows={workflows}
      onSelectFolder={handleSelectFolder}
      onSaveApiKey={handleSaveApiKey}
      onInstallAutomation={handleInstallAutomation}
      onUninstallAutomation={handleUninstallAutomation}
      onConnectRepo={handleConnectRepo}
      onDisconnectRepo={handleDisconnectRepo}
      onBrowseRepo={handleBrowseRepo}
      onGoToStep={handleGoToStep}
      onNextStep={handleNextStep}
      onPrevStep={handlePrevStep}
      onComplete={handleComplete}
    />
  )
}
