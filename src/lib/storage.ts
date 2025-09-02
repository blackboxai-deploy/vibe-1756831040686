import { Page, PageTree, Template } from '@/types/page';
import { Database } from '@/types/database';

class StorageManager {
  private readonly PAGES_KEY = 'notion_pages';
  private readonly DATABASES_KEY = 'notion_databases';
  private readonly TEMPLATES_KEY = 'notion_templates';
  private readonly SETTINGS_KEY = 'notion_settings';

  // Page Management
  savePages(pages: Page[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.PAGES_KEY, JSON.stringify(pages));
    }
  }

  loadPages(): Page[] {
    if (typeof window === 'undefined') return this.getDefaultPages();
    
    try {
      const saved = localStorage.getItem(this.PAGES_KEY);
      if (!saved) return this.getDefaultPages();
      
      const pages = JSON.parse(saved);
      return pages.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading pages:', error);
      return this.getDefaultPages();
    }
  }

  savePage(page: Page): void {
    const pages = this.loadPages();
    const existingIndex = pages.findIndex(p => p.id === page.id);
    
    if (existingIndex >= 0) {
      pages[existingIndex] = { ...page, updatedAt: new Date() };
    } else {
      pages.push(page);
    }
    
    this.savePages(pages);
  }

  deletePage(pageId: string): void {
    const pages = this.loadPages();
    const filteredPages = pages.filter(p => p.id !== pageId && p.parentId !== pageId);
    this.savePages(filteredPages);
  }

  // Database Management
  saveDatabases(databases: Database[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.DATABASES_KEY, JSON.stringify(databases));
    }
  }

  loadDatabases(): Database[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(this.DATABASES_KEY);
      if (!saved) return [];
      
      const databases = JSON.parse(saved);
      return databases.map((db: any) => ({
        ...db,
        createdAt: new Date(db.createdAt),
        updatedAt: new Date(db.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading databases:', error);
      return [];
    }
  }

  saveDatabase(database: Database): void {
    const databases = this.loadDatabases();
    const existingIndex = databases.findIndex(db => db.id === database.id);
    
    if (existingIndex >= 0) {
      databases[existingIndex] = { ...database, updatedAt: new Date() };
    } else {
      databases.push(database);
    }
    
    this.saveDatabases(databases);
  }

  // Templates Management
  saveTemplates(templates: Template[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    }
  }

  loadTemplates(): Template[] {
    if (typeof window === 'undefined') return this.getDefaultTemplates();
    
    try {
      const saved = localStorage.getItem(this.TEMPLATES_KEY);
      if (!saved) return this.getDefaultTemplates();
      
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading templates:', error);
      return this.getDefaultTemplates();
    }
  }

  // Page Tree Utilities
  buildPageTree(pages: Page[]): PageTree[] {
    const rootPages = pages.filter(page => !page.parentId);
    return rootPages.map(page => this.buildPageTreeNode(page, pages));
  }

  private buildPageTreeNode(page: Page, allPages: Page[]): PageTree {
    const children = allPages.filter(p => p.parentId === page.id);
    return {
      id: page.id,
      title: page.title || 'Untitled',
      icon: page.icon,
      children: children.map(child => this.buildPageTreeNode(child, allPages)),
      hasChildren: children.length > 0,
      isExpanded: false
    };
  }

  // Default Data
  private getDefaultPages(): Page[] {
    const defaultPage: Page = {
      id: 'welcome_page',
      title: 'Welcome to Your Workspace',
      icon: '👋',
      content: [
        {
          id: 'block_1',
          type: 'heading_1',
          content: 'Welcome to Your Notion-like Workspace',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_2',
          type: 'paragraph',
          content: 'This is your personal productivity workspace. You can create pages, databases, and organize your thoughts and projects here.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_3',
          type: 'heading_2',
          content: 'Getting Started',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_4',
          type: 'bulleted_list_item',
          content: 'Create a new page by clicking the "+" button in the sidebar',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_5',
          type: 'bulleted_list_item',
          content: 'Try different content blocks by typing "/" in any page',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_6',
          type: 'bulleted_list_item',
          content: 'Create databases to organize information in tables, boards, or galleries',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'block_7',
          type: 'bulleted_list_item',
          content: 'Use AI assistance to generate content and improve your writing',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      workspaceId: 'default_workspace',
      createdBy: 'system',
      lastEditedBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return [defaultPage];
  }

  private getDefaultTemplates(): Template[] {
    return [
      {
        id: 'template_meeting_notes',
        name: 'Meeting Notes',
        description: 'Template for taking structured meeting notes',
        icon: '📝',
        category: 'Productivity',
        content: [
          { id: 'tmpl_1', type: 'heading_1', content: 'Meeting Notes', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_2', type: 'paragraph', content: 'Date: ', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_3', type: 'paragraph', content: 'Attendees: ', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_4', type: 'heading_2', content: 'Agenda', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_5', type: 'heading_2', content: 'Discussion Points', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_6', type: 'heading_2', content: 'Action Items', createdAt: new Date(), updatedAt: new Date() }
        ],
        isPublic: true,
        createdBy: 'system',
        usageCount: 0
      },
      {
        id: 'template_project_brief',
        name: 'Project Brief',
        description: 'Template for project planning and briefs',
        icon: '🚀',
        category: 'Project Management',
        content: [
          { id: 'tmpl_7', type: 'heading_1', content: 'Project Brief', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_8', type: 'heading_2', content: 'Project Overview', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_9', type: 'heading_2', content: 'Objectives', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_10', type: 'heading_2', content: 'Timeline', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_11', type: 'heading_2', content: 'Resources', createdAt: new Date(), updatedAt: new Date() },
          { id: 'tmpl_12', type: 'heading_2', content: 'Success Criteria', createdAt: new Date(), updatedAt: new Date() }
        ],
        isPublic: true,
        createdBy: 'system',
        usageCount: 0
      }
    ];
  }

  // Settings Management
  saveSettings(settings: Record<string, unknown>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }
  }

  loadSettings(): Record<string, unknown> {
    if (typeof window === 'undefined') {
      return {
        theme: 'light',
        sidebarWidth: 240,
        showLineNumbers: false,
        autoSave: true
      };
    }
    
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      return saved ? JSON.parse(saved) : {
        theme: 'light',
        sidebarWidth: 240,
        showLineNumbers: false,
        autoSave: true
      };
    } catch {
      console.error('Error loading settings');
      return {
        theme: 'light',
        sidebarWidth: 240,
        showLineNumbers: false,
        autoSave: true
      };
    }
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      pages: this.loadPages(),
      databases: this.loadDatabases(),
      templates: this.loadTemplates(),
      settings: this.loadSettings(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.pages) this.savePages(data.pages);
      if (data.databases) this.saveDatabases(data.databases);
      if (data.templates) this.saveTemplates(data.templates);
      if (data.settings) this.saveSettings(data.settings);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }
}

export const storageManager = new StorageManager();