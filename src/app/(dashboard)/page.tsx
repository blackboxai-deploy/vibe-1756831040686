"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BlockEditor } from '@/components/editor/block-editor';
import { storageManager } from '@/lib/storage';
import { Page } from '@/types/page';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load the first page by default
    const pages = storageManager.loadPages();
    if (pages.length > 0) {
      setCurrentPage(pages[0]);
    }
  }, []);

  const handlePageSelect = (pageId: string) => {
    const pages = storageManager.loadPages();
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setCurrentPage(page);
      setIsEditing(true);
    }
  };

  const handlePageChange = (updatedPage: Page) => {
    setCurrentPage(updatedPage);
    storageManager.savePage(updatedPage);
    setIsEditing(true);
  };

  const handleTitleChange = (newTitle: string) => {
    if (currentPage) {
      const updatedPage = { ...currentPage, title: newTitle, updatedAt: new Date() };
      setCurrentPage(updatedPage);
      storageManager.savePage(updatedPage);
    }
  };

  const handleSave = () => {
    if (currentPage) {
      storageManager.savePage(currentPage);
      setIsEditing(false);
    }
  };

  const handleCreatePage = () => {
    // Refresh the page to show new pages
    const pages = storageManager.loadPages();
    if (pages.length > 0) {
      const latestPage = pages[pages.length - 1];
      setCurrentPage(latestPage);
      setIsEditing(true);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        currentPageId={currentPage?.id}
        onPageSelect={handlePageSelect}
        onCreatePage={handleCreatePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          currentPage={currentPage}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          isEditing={isEditing}
        />

        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-white">
          {currentPage ? (
            <BlockEditor
              page={currentPage}
              onPageChange={handlePageChange}
              onSave={handleSave}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📝</span>
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome to your workspace
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Start by creating your first page or selecting an existing one from the sidebar.
                  Use the rich editor to write, organize, and collaborate on your ideas.
                </p>
                
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span>💡</span>
                    <span>Type &ldquo;/&rdquo; to access the block menu</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🤖</span>
                    <span>Use AI to help generate content</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📋</span>
                    <span>Create databases and different views</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}