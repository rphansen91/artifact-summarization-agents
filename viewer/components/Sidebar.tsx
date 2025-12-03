import React from 'react';
import Link from 'next/link';
import { getArtifactsTree } from '@/app/actions';
import { FileTree } from './FileTree';

export async function Sidebar() {
  const artifactsTree = await getArtifactsTree();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-indigo-500/20 flex flex-col z-50 rounded-none border-y-0 border-l-0">
      <div className="p-6 border-b border-indigo-500/20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Antigravity</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors group"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Artifacts</span>
        </Link>

        {/* Placeholder for future links */}
        <div className="px-3 py-2 rounded-lg text-gray-600 cursor-not-allowed flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Projects</span>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Artifacts Browser
          </div>
          <FileTree items={artifactsTree} />
        </div>
      </nav>

      <div className="p-4 border-t border-indigo-500/20">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            RH
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Ryan Hansen</span>
            <span className="text-xs text-gray-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

