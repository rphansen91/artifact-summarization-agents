import { Folder, FolderOpen, Check } from 'lucide-react'

interface Step1FolderProps {
  artifactsFolder: string
  artifactsFolderSet: boolean
  onSelectFolder?: () => void
}

export function Step1Folder({
  artifactsFolder,
  artifactsFolderSet,
  onSelectFolder
}: Step1FolderProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
          <FolderOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Choose Your Artifacts Folder
        </h2>
        <p
          className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          This is where Artifact Engine will store your captured work.
          We'll create a year/week/category structure inside this folder.
        </p>
      </div>

      {/* Folder selection */}
      <div className="max-w-lg mx-auto">
        {artifactsFolderSet ? (
          <div className="space-y-4">
            {/* Selected folder display */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <Folder className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-emerald-800 dark:text-emerald-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Selected folder
                </p>
                <p
                  className="text-sm text-emerald-600 dark:text-emerald-400 truncate"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {artifactsFolder}
                </p>
              </div>
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            </div>

            {/* Change folder button */}
            <button
              onClick={onSelectFolder}
              className="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600
                text-zinc-700 dark:text-zinc-300 font-medium
                hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Choose Different Folder
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectFolder}
            className="group w-full p-8 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600
              hover:border-emerald-400 dark:hover:border-emerald-500
              hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20
              transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl
                bg-zinc-100 dark:bg-zinc-800
                group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900
                transition-colors duration-200">
                <Folder className="w-7 h-7 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="text-center">
                <p
                  className="font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Click to Browse
                </p>
                <p
                  className="text-sm text-zinc-500 dark:text-zinc-400 mt-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Select a folder on your computer
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Info callout */}
      <div className="max-w-lg mx-auto p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <p
          className="text-sm text-amber-800 dark:text-amber-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <strong>Tip:</strong> Choose a folder synced to iCloud, Dropbox, or another cloud service
          to access your artifacts across devices.
        </p>
      </div>
    </div>
  )
}
