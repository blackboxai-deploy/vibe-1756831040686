"use client";

import { useState, useRef, useEffect } from 'react';
import { PageBlock, BlockType } from '@/types/page';
import { Button } from '@/components/ui/button';

interface ContentBlockProps {
  block: PageBlock;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updates: Partial<PageBlock>) => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
}

export function ContentBlock({
  block,
  isActive,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onAddBlock,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onFocus,
  onBlur,
  onKeyDown,
  onPaste
}: ContentBlockProps) {
  const [showActions, setShowActions] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && contentRef.current && block.content === '') {
      contentRef.current.focus();
    }
  }, [isActive, block.content]);

  const handleContentChange = (content: string) => {
    onUpdate({ content });
  };

  const renderContent = () => {
    const commonProps = {
      ref: contentRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        handleContentChange(target.textContent || '');
      },
      onFocus,
      onBlur,
      onKeyDown,
      onPaste,
      className: `
        outline-none focus:ring-0 border-none resize-none overflow-hidden
        ${block.content === '' ? 'text-gray-400' : 'text-gray-900'}
      `,
      'data-placeholder': getPlaceholder()
    };

    const content = block.content || '';

    switch (block.type) {
      case 'heading_1':
        return (
          <h1
            {...commonProps}
            className={`${commonProps.className} text-3xl font-bold leading-tight`}
          >
            {content}
          </h1>
        );

      case 'heading_2':
        return (
          <h2
            {...commonProps}
            className={`${commonProps.className} text-2xl font-semibold leading-tight`}
          >
            {content}
          </h2>
        );

      case 'heading_3':
        return (
          <h3
            {...commonProps}
            className={`${commonProps.className} text-xl font-semibold leading-tight`}
          >
            {content}
          </h3>
        );

      case 'bulleted_list_item':
        return (
          <div className="flex items-start space-x-2">
            <span className="text-gray-500 mt-1">•</span>
            <div
              {...commonProps}
              className={`${commonProps.className} flex-1`}
            >
              {content}
            </div>
          </div>
        );

      case 'numbered_list_item':
        return (
          <div className="flex items-start space-x-2">
            <span className="text-gray-500 mt-1">1.</span>
            <div
              {...commonProps}
              className={`${commonProps.className} flex-1`}
            >
              {content}
            </div>
          </div>
        );

      case 'to_do':
        return (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              className="mt-1"
              onChange={(e) => {
                onUpdate({ 
                  properties: { 
                    ...block.properties, 
                    completed: e.target.checked 
                  }
                });
              }}
              checked={block.properties?.completed || false}
            />
            <div
              {...commonProps}
              className={`${commonProps.className} flex-1 ${
                block.properties?.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {content}
            </div>
          </div>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2">
            <div
              {...commonProps}
              className={`${commonProps.className} italic text-gray-700`}
            >
              {content}
            </div>
          </blockquote>
        );

      case 'code':
        return (
          <pre className="bg-gray-100 rounded-md p-4 overflow-x-auto">
            <code
              {...commonProps}
              className={`${commonProps.className} font-mono text-sm`}
            >
              {content}
            </code>
          </pre>
        );

      case 'divider':
        return (
          <hr className="my-6 border-gray-300" />
        );

      default:
        return (
          <p
            {...commonProps}
            className={`${commonProps.className} leading-relaxed`}
          >
            {content}
          </p>
        );
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading_1': return 'Heading 1';
      case 'heading_2': return 'Heading 2';
      case 'heading_3': return 'Heading 3';
      case 'bulleted_list_item': return 'List item';
      case 'numbered_list_item': return 'List item';
      case 'to_do': return 'To-do item';
      case 'quote': return 'Quote';
      case 'code': return 'Code';
      default: return 'Type \'/\' for commands';
    }
  };

  if (block.type === 'divider') {
    return (
      <div
        className="group relative py-4"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <hr className="border-gray-300" />
        
        {/* Block Actions */}
        {showActions && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDuplicate}
              className="h-6 w-6 p-0"
            >
              ⧉
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-red-500"
            >
              ✕
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative py-1 hover:bg-gray-50 rounded-md transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Block Actions */}
      {showActions && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddBlock('paragraph')}
            className="h-6 w-6 p-0"
            title="Add block"
          >
            +
          </Button>
          
          <div className="flex flex-col space-y-1">
            {!isFirst && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMoveUp}
                className="h-6 w-6 p-0"
                title="Move up"
              >
                ↑
              </Button>
            )}
            
            {!isLast && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMoveDown}
                className="h-6 w-6 p-0"
                title="Move down"
              >
                ↓
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDuplicate}
              className="h-6 w-6 p-0"
              title="Duplicate"
            >
              ⧉
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-red-500"
              title="Delete"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-2">
        {renderContent()}
      </div>
    </div>
  );
}