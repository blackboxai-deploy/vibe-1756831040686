"use client";

import { useState, useEffect, useRef } from 'react';
import { Page, PageBlock, BlockType } from '@/types/page';
import { ContentBlock } from './content-block';
import { BlockMenu } from './block-menu';
import { aiClient } from '@/lib/ai-client';

interface BlockEditorProps {
  page: Page;
  onPageChange: (page: Page) => void;
  onSave: () => void;
}

export function BlockEditor({ page, onPageChange, onSave }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(page.content || []);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBlocks(page.content || []);
  }, [page.content]);

  useEffect(() => {
    // Auto-save after changes
    const timeoutId = setTimeout(() => {
      const updatedPage = { ...page, content: blocks, updatedAt: new Date() };
      onPageChange(updatedPage);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [blocks, page, onPageChange]);

  const updateBlock = (blockId: string, updates: Partial<PageBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates, updatedAt: new Date() } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const addBlock = (afterBlockId: string, type: BlockType = 'paragraph') => {
    const newBlock: PageBlock = {
      id: 'block_' + Date.now(),
      type,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const afterIndex = blocks.findIndex(block => block.id === afterBlockId);
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    setBlocks(newBlocks);

    // Focus the new block
    setTimeout(() => {
      setActiveBlockId(newBlock.id);
    }, 100);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const duplicateBlock = (blockId: string) => {
    const originalBlock = blocks.find(block => block.id === blockId);
    if (!originalBlock) return;

    const duplicatedBlock: PageBlock = {
      ...originalBlock,
      id: 'block_' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const originalIndex = blocks.findIndex(block => block.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(originalIndex + 1, 0, duplicatedBlock);
    setBlocks(newBlocks);
  };

  const handleBlockMenuSelect = async (type: BlockType | 'ai_continue', blockId: string) => {
    if (type === 'ai_continue') {
      await handleAIGeneration(blockId);
      return;
    }

    updateBlock(blockId, { type: type as BlockType, content: type === 'divider' ? '---' : '' });
    setShowBlockMenu(false);
  };

  const handleAIGeneration = async (blockId: string) => {
    setIsAIGenerating(true);
    try {
      // Get context from previous blocks
      const currentIndex = blocks.findIndex(block => block.id === blockId);
      const contextBlocks = blocks.slice(Math.max(0, currentIndex - 3), currentIndex);
      const context = contextBlocks.map(block => block.content).join('\n');

      const prompt = `Continue writing based on this context. Write the next paragraph or section that would naturally follow:\n\n${context}`;
      
      const response = await aiClient.generateContent(prompt, 'Content continuation for a productivity workspace');
      
      updateBlock(blockId, { content: response.content });
    } catch (error) {
      console.error('AI generation failed:', error);
      updateBlock(blockId, { content: 'Failed to generate content. Please try again.' });
    } finally {
      setIsAIGenerating(false);
      setShowBlockMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === '/') {
      e.preventDefault();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setBlockMenuPosition({ x: rect.left, y: rect.bottom + 5 });
      setShowBlockMenu(true);
      setActiveBlockId(blockId);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.content === '' && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent, blockId: string) => {
    const text = e.clipboardData.getData('text');
    if (text.includes('\n')) {
      e.preventDefault();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length > 1) {
        // Update current block with first line
        updateBlock(blockId, { content: lines[0] });
        
        // Add remaining lines as new blocks
        const currentIndex = blocks.findIndex(block => block.id === blockId);
        const newBlocks = [...blocks];
        
        lines.slice(1).forEach((line, index) => {
          const newBlock: PageBlock = {
            id: 'block_' + (Date.now() + index),
            type: 'paragraph',
            content: line,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newBlocks.splice(currentIndex + 1 + index, 0, newBlock);
        });
        
        setBlocks(newBlocks);
      }
    }
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div ref={editorRef} className="space-y-2">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Start typing or press &ldquo;/&rdquo; for options</p>
            <button
              onClick={() => addBlock('', 'paragraph')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Add your first block
            </button>
          </div>
        ) : (
          blocks.map((block, index) => (
            <ContentBlock
              key={block.id}
              block={block}
              isActive={activeBlockId === block.id}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
              onAddBlock={(type) => addBlock(block.id, type)}
              onMoveUp={() => moveBlock(block.id, 'up')}
              onMoveDown={() => moveBlock(block.id, 'down')}
              onDuplicate={() => duplicateBlock(block.id)}
              onFocus={() => setActiveBlockId(block.id)}
              onBlur={() => setActiveBlockId(null)}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              onPaste={(e) => handlePaste(e, block.id)}
            />
          ))
        )}
      </div>

      {/* Block Menu */}
      {showBlockMenu && (
        <BlockMenu
          position={blockMenuPosition}
          onSelect={(type) => activeBlockId && handleBlockMenuSelect(type, activeBlockId)}
          onClose={() => setShowBlockMenu(false)}
          isAIGenerating={isAIGenerating}
        />
      )}

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}