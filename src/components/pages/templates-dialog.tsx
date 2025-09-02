"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { storageManager } from '@/lib/storage';
import { aiClient } from '@/lib/ai-client';
import { Template } from '@/types/page';

interface TemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: (template: Template) => void;
}

export function TemplatesDialog({ isOpen, onClose, onTemplateSelected }: TemplatesDialogProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'project management', name: 'Project Management' },
    { id: 'meeting', name: 'Meeting Notes' },
    { id: 'planning', name: 'Planning' },
    { id: 'creative', name: 'Creative' },
    { id: 'personal', name: 'Personal' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = () => {
    const savedTemplates = storageManager.loadTemplates();
    setTemplates(savedTemplates);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
      template.category.toLowerCase() === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleGenerateCustomTemplate = async () => {
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const content = await aiClient.generateTemplate('custom', customPrompt);
      
      const customTemplate: Template = {
        id: 'custom_' + Date.now(),
        name: 'AI Generated Template',
        description: customPrompt,
        icon: '🤖',
        category: 'AI Generated',
        content,
        isPublic: false,
        createdBy: 'ai',
        usageCount: 0
      };

      // Save the generated template
      const updatedTemplates = [...templates, customTemplate];
      setTemplates(updatedTemplates);
      storageManager.saveTemplates(updatedTemplates);
      
      // Select the new template
      onTemplateSelected(customTemplate);
      setCustomPrompt('');
    } catch (error) {
      console.error('Failed to generate template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full"
          />
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-3 py-1 text-sm rounded-full transition-colors
                  ${activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <Separator />
          
          {/* AI Template Generation */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🤖</span>
              <span className="font-medium text-gray-900">Generate Custom Template with AI</span>
            </div>
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the template you need (e.g., 'A weekly meal planning template with grocery list')"
              className="w-full"
            />
            <Button
              onClick={handleGenerateCustomTemplate}
              disabled={!customPrompt.trim() || isGenerating}
              size="sm"
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Template'}
            </Button>
          </div>
          
          <Separator />
          
          {/* Templates List */}
          <ScrollArea className="h-64">
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {searchQuery ? 'No templates match your search' : 'No templates available'}
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    onClick={() => onTemplateSelected(template)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{template.usageCount} uses</span>
                          {template.isPublic && <Badge variant="secondary">Public</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}