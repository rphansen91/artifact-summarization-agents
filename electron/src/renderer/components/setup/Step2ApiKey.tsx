import { useState } from 'react'
import { Key, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface Step2ApiKeyProps {
  apiKey: string
  apiKeySet: boolean
  onSaveApiKey?: (apiKey: string) => void
}

export function Step2ApiKey({
  apiKey,
  apiKeySet,
  onSaveApiKey
}: Step2ApiKeyProps) {
  const [inputValue, setInputValue] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    if (inputValue.trim()) {
      onSaveApiKey?.(inputValue.trim())
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
          <Key className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Connect Your API Key
        </h2>
        <p
          className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Your OpenAI API key enables AI-powered analysis and contextualization of your artifacts.
        </p>
      </div>

      {/* API key input */}
      <div className="max-w-lg mx-auto space-y-4">
        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 pr-12 rounded-xl
                bg-white dark:bg-zinc-800
                border border-zinc-300 dark:border-zinc-600
                text-zinc-900 dark:text-zinc-100
                placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                transition-all"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
                hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              {showKey ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!inputValue.trim()}
          className={`
            w-full py-3 px-4 rounded-xl font-semibold transition-all
            ${inputValue.trim()
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
            }
          `}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {apiKeySet ? 'Update API Key' : 'Save API Key'}
        </button>

        {/* Get API key link */}
        <div className="text-center">
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400
              hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Don't have an API key? Get one from OpenAI
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Security note */}
      <div className="max-w-lg mx-auto p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <p
          className="text-sm text-zinc-600 dark:text-zinc-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <strong className="text-zinc-700 dark:text-zinc-300">Your key is stored locally.</strong>{' '}
          It never leaves your machine and is only used to communicate with OpenAI's API for artifact analysis.
        </p>
      </div>
    </div>
  )
}
