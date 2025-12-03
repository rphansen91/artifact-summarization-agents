'use client';

import { useState } from 'react';
import { TreeItem } from '@/app/actions';

interface FileTreeProps {
  items: TreeItem[];
  level?: number;
  selectedItem?: TreeItem | null;
  onItemSelect?: (item: TreeItem) => void;
}

export function FileTree({ items, level = 0, selectedItem, onItemSelect }: FileTreeProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <FileTreeItem 
          key={item.path} 
          item={item} 
          level={level} 
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
        />
      ))}
    </ul>
  );
}

function FileTreeItem({ 
  item, 
  level, 
  selectedItem, 
  onItemSelect 
}: { 
  item: TreeItem; 
  level: number;
  selectedItem?: TreeItem | null;
  onItemSelect?: (item: TreeItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isDirectory = item.type === 'directory';
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedItem?.path === item.path;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
    onItemSelect?.(item);
  };

  return (
    <li>
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer select-none group
          text-sm transition-colors
          ${isSelected 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }
          ${isOpen ? 'text-white' : ''}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="opacity-70">
          {isDirectory ? (
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </span>
        <span className="truncate">{item.name}</span>
        {!isDirectory && item.extensions && item.extensions.length > 0 && (
          <span className="ml-1 text-blue-300 opacity-60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
        )}
        {isDirectory && item.fileCount !== undefined && item.fileCount > 0 && (
          <span className="ml-1 text-xs bg-gray-600/30 text-gray-300 px-1.5 py-0.5 rounded-full">
            {item.fileCount}
          </span>
        )}
        {isDirectory && item.name.includes('Week_') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const encodedPath = encodeURIComponent(item.path);
              window.location.href = `/week-details?path=${encodedPath}`;
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-600/20 rounded text-indigo-400 hover:text-indigo-300"
            title="View week details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
      </div>

      {isDirectory && isOpen && hasChildren && (
        <FileTree 
          items={item.children!} 
          level={level + 1} 
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
        />
      )}
    </li>
  );
}
