import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Settings, Sparkles, FolderOpen } from 'lucide-react'
import { AppShell, type NavigationItem } from './components/shell'
import { SetupPage, CapturePage, ContextualizePage, BrowsePage, SettingsPage } from './pages'
import { BrowseSidebar } from './components/browse'
import { BrowseProvider } from './contexts/BrowseContext'
import './styles/globals.css'

// Navigation configuration
const navItems: Omit<NavigationItem, 'isActive'>[] = [
  {
    label: 'Contextualize',
    href: '/contextualize',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    label: 'Browse',
    href: '/browse',
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
]

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCheckingConfig, setIsCheckingConfig] = useState(true)

  // Check config on mount and redirect accordingly
  useEffect(() => {
    async function checkConfig() {
      if (location.pathname !== '/') {
        setIsCheckingConfig(false)
        return
      }

      try {
        const config = await window.electronAPI.getConfig()
        // If artifacts folder is configured, go to main app
        if (config.artifactsFolder) {
          navigate('/contextualize')
        } else {
          navigate('/setup')
        }
      } catch {
        navigate('/setup')
      } finally {
        setIsCheckingConfig(false)
      }
    }

    checkConfig()
  }, [location.pathname, navigate])

  // Add isActive to navigation items
  const navigationItems: NavigationItem[] = navItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  // Show loading while checking config at root
  if (location.pathname === '/' && isCheckingConfig) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Setup page uses its own full-screen wizard layout
  if (location.pathname === '/setup') {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
      </Routes>
    )
  }

  const isBrowsePage = location.pathname === '/browse'

  // Wrap browse page with its provider
  if (isBrowsePage) {
    return (
      <BrowseProvider>
        <AppShell
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          sidebarContent={<BrowseSidebar />}
        >
          <Routes>
            <Route path="/browse" element={<BrowsePage />} />
          </Routes>
        </AppShell>
      </BrowseProvider>
    )
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      onNavigate={handleNavigate}
    >
      <Routes>
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/contextualize" element={<ContextualizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<ContextualizePage />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App
