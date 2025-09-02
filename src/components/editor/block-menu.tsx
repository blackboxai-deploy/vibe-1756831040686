"use client";

import { useState, useEffect, useRef } from 'react';
import { BlockType } from '@/types/page';

interface BlockMenuProps {
  position: { x: number; y: number };
  onSelect: (type: BlockType | 'ai_continue') => void;
  onClose: () => void;
  isAIGenerating?: boolean;
}

interface BlockMenuItem {
  type: BlockType | 'ai_continue';
  title: string;
  description: string;
  icon: string;
  category: 'text' | 'list' | 'media' | 'advanced' | 'ai';
}

const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  // Text blocks
  {
    type: 'paragraph',
    title: 'Text',
    description: 'Just start writing with plain text',
    icon: '📝',
    category: 'text'
  },
  {
    type: 'heading_1',
    title: 'Heading 1',
    description: 'Big section heading',
    icon: 'H1',
    category: 'text'
  },
  {
    type: 'heading_2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    category: 'text'
  },
  {
    type: 'heading_3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    category: 'text'
  },
  
  // List blocks
  {
    type: 'bulleted_list_item',
    title: 'Bulleted list',
    description: 'Create a simple bulleted list',
    icon: '•',
    category: 'list'
  },
  {
    type: 'numbered_list_item',
    title: 'Numbered list',
    description: 'Create a list with numbering',
    icon: '1.',
    category: 'list'
  },
  {
    type: 'to_do',
    title: 'To-do list',
    description: 'Track tasks with a to-do list',
    icon: '☐',
    category: 'list'
  },
  {
    type: 'toggle',
    title: 'Toggle list',
    description: 'Toggleable list item',
    icon: '▶',
    category: 'list'
  },
  
  // Advanced blocks
  {
    type: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    icon: '"',
    category: 'advanced'
  },
  {
    type: 'code',
    title: 'Code',
    description: 'Capture a code snippet',
    icon: '{}',
    category: 'advanced'
  },
  {
    type: 'divider',
    title: 'Divider',
    description: 'Visually divide blocks',
    icon: '―',
    category: 'advanced'
  },
  
  // Media blocks (for future implementation)
  {
    type: 'image',
    title: 'Image',
    description: 'Upload or embed with a link',
    icon: '🖼️',
    category: 'media'
  },
  
  // AI blocks
  {
    type: 'ai_continue',
    title: 'Continue writing',
    description: 'Let AI continue the content',
    icon: '🤖',
    category: 'ai'
  }
];

export function BlockMenu({ position, onSelect, onClose, isAIGenerating }: BlockMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = BLOCK_MENU_ITEMS.filter(item => {
    if (searchQuery === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(filteredItems.length - 1, prev + 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].type);
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredItems, selectedIndex, onClose, onSelect]);

  const categories = [
    { id: 'text', name: 'Basic blocks' },
    { id: 'list', name: 'Lists' },
    { id: 'media', name: 'Media' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'ai', name: 'AI Assistant' }
  ];

  const groupedItems = categories.reduce((acc, category) => {
    const items = filteredItems.filter(item => item.category === category.id);
    if (items.length > 0) {
      acc.push({ category, items });
    }
    return acc;
  }, [] as { category: typeof categories[0]; items: BlockMenuItem[] }[]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(5px)'
      }}
    >
      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Search for a block type..."
          className="w-full px-2 py-1 text-sm border-none outline-none bg-transparent"
        />
      </div>

      {/* Menu Items */}
      <div className="max-h-80 overflow-y-auto">
        {groupedItems.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-500 text-sm">
            No blocks found
          </div>
        ) : (
          groupedItems.map((group, groupIndex) => (
            <div key={group.category.id}>
              {groupIndex > 0 && <div className="border-t border-gray-100" />}
              
              <div className="px-3 py-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {group.category.name}
                </h4>
                
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const globalIndex = filteredItems.indexOf(item);
                    const isSelected = selectedIndex === globalIndex;
                    const isDisabled = item.type === 'ai_continue' && isAIGenerating;
                    
                    return (
                      <button
                        key={item.type}
                        onClick={() => !isDisabled && onSelect(item.type)}
                        disabled={isDisabled}
                        className={`
                          w-full text-left px-2 py-2 rounded-md transition-colors flex items-center space-x-3
                          ${isSelected
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-700'
                          }
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {item.title}
                            {isDisabled && ' (Generating...)'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
        ↑↓ to navigate • ↵ to select • esc to close
      </div>
    </div>
  );
}