"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { aiClient } from '@/lib/ai-client';

interface AIAssistantProps {
  onContentGenerated?: (content: string) => void;
  context?: string;
}

export function AIAssistant({ onContentGenerated, context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'generate' | 'improve' | 'summarize'>('generate');

  const prompts = {
    generate: [
      'Write a blog post about productivity tips',
      'Create a project plan for a mobile app',
      'Write meeting notes template',
      'Draft a product requirements document',
      'Create a weekly report template'
    ],
    improve: [
      'Make this text more professional',
      'Improve clarity and flow',
      'Make it more concise',
      'Add more details and examples',
      'Correct grammar and spelling'
    ],
    summarize: [
      'Summarize this in 3 bullet points',
      'Create a brief executive summary',
      'Extract key action items',
      'Highlight main insights',
      'Create a one-paragraph summary'
    ]
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      let response;
      
      switch (mode) {
        case 'improve':
          response = await aiClient.improveWriting(context || '', prompt);
          break;
        case 'summarize':
          response = await aiClient.summarizeText(context || '', 200);
          break;
        default:
          response = await aiClient.generateContent(prompt, context);
          response = typeof response === 'string' ? response : response.content;
      }
      
      setGeneratedContent(response);
    } catch (error) {
      console.error('AI generation failed:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent && onContentGenerated) {
      onContentGenerated(generatedContent);
      setIsOpen(false);
      setPrompt('');
      setGeneratedContent('');
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setPrompt('');
    setGeneratedContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="space-x-2">
          <span>🤖</span>
          <span>AI Assistant</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🤖</span>
            <span>AI Writing Assistant</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex space-x-2">
            {(['generate', 'improve', 'summarize'] as const).map((modeOption) => (
              <Button
                key={modeOption}
                variant={mode === modeOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange(modeOption)}
                className="capitalize"
              >
                {modeOption}
              </Button>
            ))}
          </div>

          {/* System Prompt Display */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-800">System Prompt</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-blue-700">
                You are a helpful AI assistant for a Notion-like productivity app. Generate clear, 
                well-structured content that would fit naturally in a productivity workspace. 
                Focus on being practical, actionable, and well-organized.
              </p>
            </CardContent>
          </Card>

          {/* Context Display */}
          {context && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Context from current page:
              </label>
              <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 max-h-20 overflow-y-auto">
                {context.substring(0, 200)}
                {context.length > 200 && '...'}
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quick prompts:
            </label>
            <div className="flex flex-wrap gap-2">
              {prompts[mode].map((quickPrompt, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setPrompt(quickPrompt)}
                >
                  {quickPrompt}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'improve' ? 'How would you like to improve the text?' : 
               mode === 'summarize' ? 'How would you like to summarize?' : 
               'What would you like me to write?'}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'improve' ? 'e.g., Make this more professional and concise' :
                mode === 'summarize' ? 'e.g., Create bullet points of key takeaways' :
                'e.g., Write a project proposal for a new mobile app'
              }
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              `${mode.charAt(0).toUpperCase() + mode.slice(1)} Content`
            )}
          </Button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Generated content:
              </label>
              <div className="p-4 bg-gray-50 rounded-md text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {generatedContent}
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleUseContent} className="flex-1">
                  Use This Content
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            Powered by Claude Sonnet 4 via OpenRouter • 
            <a 
              href="#" 
              className="text-blue-600 hover:underline ml-1"
              onClick={(e) => e.preventDefault()}
            >
              Learn more about AI assistance
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}