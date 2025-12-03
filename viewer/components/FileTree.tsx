'use client';

import React, { useState } from 'react';
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
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer select-none
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
