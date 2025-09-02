"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { authManager } from '@/lib/auth';
import { storageManager } from '@/lib/storage';
import { PageTree } from '@/types/page';
import { PageTreeItem } from './page-tree-item';
import { CreatePageDialog } from '../pages/create-page-dialog';
import { TemplatesDialog } from '../pages/templates-dialog';

interface SidebarProps {
  currentPageId?: string;
  onPageSelect: (pageId: string) => void;
  onCreatePage: () => void;
}

export function Sidebar({ currentPageId, onPageSelect, onCreatePage }: SidebarProps) {
  const [user, setUser] = useState(authManager.getAuthState().user);
  const [pageTree, setPageTree] = useState<PageTree[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = authManager.subscribe((authState) => {
      setUser(authState.user);
    });

    loadPageTree();
    return unsubscribe;
  }, []);

  const loadPageTree = () => {
    const pages = storageManager.loadPages();
    const tree = storageManager.buildPageTree(pages);
    setPageTree(tree);
  };

  const handleLogout = () => {
    authManager.logout();
  };

  const handlePageCreated = () => {
    loadPageTree();
    setIsCreateDialogOpen(false);
    onCreatePage();
  };

  const handleToggleExpanded = (pageId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredTree = pageTree.filter(page => 
    searchQuery === '' || 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
            <span className="font-semibold text-gray-900">Workspace</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
        
        <Input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm"
        />
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full justify-start text-sm"
          variant="ghost"
        >
          <span className="mr-2">+</span>
          New Page
        </Button>
        
        <Button
          onClick={() => setIsTemplatesDialogOpen(true)}
          className="w-full justify-start text-sm"
          variant="ghost"
        >
          <span className="mr-2">📄</span>
          Templates
        </Button>
        
        <Button
          className="w-full justify-start text-sm"
          variant="ghost"
          onClick={() => {/* TODO: Implement database creation */}}
        >
          <span className="mr-2">🗃️</span>
          New Database
        </Button>
      </div>

      <Separator />

      {/* Pages Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTree.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              {searchQuery ? 'No pages match your search' : 'No pages yet'}
            </div>
          ) : (
            filteredTree.map((page) => (
              <PageTreeItem
                key={page.id}
                item={page}
                level={0}
                isActive={currentPageId === page.id}
                isExpanded={expandedItems.has(page.id)}
                onSelect={() => onPageSelect(page.id)}
                onToggleExpanded={handleToggleExpanded}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'No email'}
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreatePageDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onPageCreated={handlePageCreated}
      />
      
      <TemplatesDialog
        isOpen={isTemplatesDialogOpen}
        onClose={() => setIsTemplatesDialogOpen(false)}
        onTemplateSelected={(_template) => {
          // TODO: Create page from template
          setIsTemplatesDialogOpen(false);
        }}
      />
    </div>
  );
}