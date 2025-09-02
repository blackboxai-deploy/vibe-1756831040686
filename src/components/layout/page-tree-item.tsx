"use client";

import { PageTree } from '@/types/page';

interface PageTreeItemProps {
  item: PageTree;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpanded: (pageId: string) => void;
}

export function PageTreeItem({
  item,
  level,
  isActive,
  isExpanded,
  onSelect,
  onToggleExpanded
}: PageTreeItemProps) {
  const handleClick = () => {
    onSelect();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(item.id);
  };

  return (
    <div>
      <div
        className={`
          flex items-center py-1 px-2 rounded cursor-pointer text-sm
          hover:bg-gray-100 transition-colors
          ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {item.hasChildren && (
          <button
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center mr-1 hover:bg-gray-200 rounded"
          >
            <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
        )}
        
        {!item.hasChildren && (
          <div className="w-4 h-4 mr-1"></div>
        )}
        
        <span className="mr-2 text-sm">
          {item.icon || '📄'}
        </span>
        
        <span className="flex-1 truncate">
          {item.title}
        </span>
      </div>
      
      {isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <PageTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              isActive={false}
              isExpanded={false}
              onSelect={() => onSelect()}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}