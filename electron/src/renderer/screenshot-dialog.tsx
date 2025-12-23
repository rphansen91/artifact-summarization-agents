import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

interface ScreenshotDialogProps {
  imagePath: string;
  filename: string;
}

function ScreenshotDialog({ imagePath, filename }: ScreenshotDialogProps) {
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Convert file path to artifact-file protocol URL
    setImageUrl(`artifact-file://${encodeURIComponent(imagePath)}`);
  }, [imagePath]);

  const handleProcess = () => {
    window.electronAPI.submitScreenshotDialog({
      action: 'process',
      notes: notes,
      imagePath,
    });
  };

  const handleSkip = () => {
    window.electronAPI.submitScreenshotDialog({
      action: 'skip',
      notes: '',
      imagePath,
    });
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 p-5">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          New Screenshot Captured
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{filename}</p>
      </div>

      {/* Image Preview */}
      <div className="mb-3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Screenshot preview"
            className="w-full max-h-64 object-contain"
          />
        )}
      </div>

      {/* Notes Input */}
      <div className="mb-3">
        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Add notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe what this screenshot shows..."
          className="w-full h-16 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl
                     text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                     border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300
                     transition-all text-sm font-medium"
        >
          Skip
        </button>
        <button
          onClick={handleProcess}
          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600
                     text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
        >
          Process
        </button>
      </div>
    </div>
  );
}

// Get screenshot info from URL params
const urlParams = new URLSearchParams(window.location.search);
const imagePath = decodeURIComponent(urlParams.get('imagePath') || '');
const filename = decodeURIComponent(urlParams.get('filename') || '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ScreenshotDialog imagePath={imagePath} filename={filename} />
  </React.StrictMode>
);
