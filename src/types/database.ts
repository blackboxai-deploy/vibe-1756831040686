export interface Database {
  id: string;
  title: string;
  description?: string;
  properties: DatabaseProperty[];
  entries: DatabaseEntry[];
  views: DatabaseView[];
  workspaceId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  required?: boolean;
  description?: string;
}

export type PropertyType = 
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'person'
  | 'files'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'formula'
  | 'relation'
  | 'rollup'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by';

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
}

export interface DatabaseEntry {
  id: string;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastEditedBy: string;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  filters: DatabaseFilter[];
  sorts: DatabaseSort[];
  groupBy?: string;
  properties: ViewProperty[];
  isDefault: boolean;
}

export type ViewType = 'table' | 'board' | 'gallery' | 'calendar' | 'timeline';

export interface DatabaseFilter {
  id: string;
  propertyId: string;
  condition: FilterCondition;
  value: unknown;
}

export type FilterCondition = 
  | 'equals'
  | 'does_not_equal'
  | 'contains'
  | 'does_not_contain'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal_to'
  | 'less_than_or_equal_to'
  | 'is_before'
  | 'is_after';

export interface DatabaseSort {
  id: string;
  propertyId: string;
  direction: 'ascending' | 'descending';
}

export interface ViewProperty {
  propertyId: string;
  visible: boolean;
  width?: number;
}