"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Page } from '@/types/page';

interface HeaderProps {
  currentPage?: Page | null;
  onTitleChange?: (title: string) => void;
  onSave?: () => void;
  isEditing?: boolean;
}

export function Header({ currentPage, onTitleChange, onSave, isEditing }: HeaderProps) {
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title || 'Untitled');
      setLastSaved(currentPage.updatedAt);
    }
  }, [currentPage]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleSave = () => {
    onSave?.();
    setLastSaved(new Date());
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!currentPage) {
    return (
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-center">
        <div className="text-gray-500">Select a page to get started</div>
      </div>
    );
  }

  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      {/* Page Title and Info */}
      <div className="flex items-center space-x-4 flex-1">
        {/* Page Icon */}
        <div className="text-2xl">
          {currentPage.icon || '📄'}
        </div>
        
        {/* Page Title */}
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-semibold border-none shadow-none px-0 focus:ring-0 bg-transparent"
            placeholder="Untitled"
          />
        </div>
        
        {/* Page Status */}
        <div className="flex items-center space-x-2">
          {isEditing && (
            <Badge variant="secondary" className="text-xs">
              Editing
            </Badge>
          )}
          
          {currentPage.isTemplate && (
            <Badge variant="outline" className="text-xs">
              Template
            </Badge>
          )}
          
          {currentPage.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
        </div>
      </div>

      <Separator orientation="vertical" className="h-6 mx-4" />

      {/* Actions and Status */}
      <div className="flex items-center space-x-4">
        {/* Last Saved */}
        {lastSaved && (
          <span className="text-sm text-gray-500">
            Saved {formatLastSaved(lastSaved)}
          </span>
        )}
        
        {/* Save Button */}
        <Button
          onClick={handleSave}
          size="sm"
          variant="outline"
          disabled={!isEditing}
        >
          Save
        </Button>
        
        {/* Share Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            // TODO: Implement sharing
            console.log('Share page:', currentPage.id);
          }}
        >
          Share
        </Button>
        
        {/* More Actions */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            // TODO: Implement more actions menu
            console.log('More actions for page:', currentPage.id);
          }}
        >
          ⋯
        </Button>
      </div>
    </div>
  );
}