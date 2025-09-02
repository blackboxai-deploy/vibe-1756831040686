export interface PageBlock {
  id: string;
  type: BlockType;
  content: unknown;
  properties?: Record<string, unknown>;
  children?: PageBlock[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BlockType = 
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bulleted_list_item'
  | 'numbered_list_item'
  | 'to_do'
  | 'toggle'
  | 'quote'
  | 'code'
  | 'divider'
  | 'image'
  | 'video'
  | 'file'
  | 'table'
  | 'database'
  | 'embed'
  | 'bookmark';

export interface Page {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  content: PageBlock[];
  parentId?: string;
  workspaceId: string;
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
  isPublic?: boolean;
  archived?: boolean;
}

export interface PageTree {
  id: string;
  title: string;
  icon?: string;
  children: PageTree[];
  hasChildren: boolean;
  isExpanded: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  content: PageBlock[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
}