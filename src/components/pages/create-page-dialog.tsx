"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { storageManager } from '@/lib/storage';
import { authManager } from '@/lib/auth';
import { Page, PageBlock } from '@/types/page';

interface CreatePageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated: (pageId: string) => void;
  parentId?: string;
}

const PAGE_ICONS = ['📄', '📝', '📋', '📊', '🚀', '💡', '🎯', '📚', '🔍', '⚡', '🌟', '🔥'];

export function CreatePageDialog({ isOpen, onClose, onPageCreated, parentId }: CreatePageDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📄');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    
    try {
      const authState = authManager.getAuthState();
      const userId = authState.user?.id || 'anonymous';
      const workspaceId = authState.workspace?.id || 'default';

      const pageId = 'page_' + Date.now();
      
      // Create initial content blocks
      const initialBlocks: PageBlock[] = [
        {
          id: 'block_' + Date.now(),
          type: 'heading_1',
          content: title,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      if (description.trim()) {
        initialBlocks.push({
          id: 'block_' + (Date.now() + 1),
          type: 'paragraph',
          content: description,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Add empty paragraph for editing
      initialBlocks.push({
        id: 'block_' + (Date.now() + 2),
        type: 'paragraph',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newPage: Page = {
        id: pageId,
        title,
        icon: selectedIcon,
        content: initialBlocks,
        parentId,
        workspaceId,
        createdBy: userId,
        lastEditedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      storageManager.savePage(newPage);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedIcon('📄');
      
      onPageCreated(pageId);
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedIcon('📄');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Page Title */}
          <div className="space-y-2">
            <Label htmlFor="page-title">Page Title</Label>
            <Input
              id="page-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title"
              autoFocus
            />
          </div>
          
          {/* Page Description */}
          <div className="space-y-2">
            <Label htmlFor="page-description">Description (optional)</Label>
            <Textarea
              id="page-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the page"
              rows={3}
            />
          </div>
          
          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Page Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {PAGE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`
                    w-10 h-10 text-xl rounded-md border-2 transition-colors
                    hover:bg-gray-100 flex items-center justify-center
                    ${selectedIcon === icon 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                    }
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Page'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}