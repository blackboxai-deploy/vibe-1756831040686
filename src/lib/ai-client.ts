interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIClient {
  private baseUrl = 'https://oi-server.onrender.com/chat/completions';
  private defaultModel = 'openrouter/anthropic/claude-sonnet-4';

  private getHeaders() {
    return {
      'CustomerId': 'cus_S16jfiBUH2cc7P',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer xxx'
    };
  }

  async generateContent(prompt: string, context?: string): Promise<AIResponse> {
    const messages: AIMessage[] = [];
    
    if (context) {
      messages.push({
        role: 'system',
        content: `You are a helpful AI assistant for a Notion-like productivity app. Context: ${context}`
      });
    } else {
      messages.push({
        role: 'system',
        content: 'You are a helpful AI assistant for a Notion-like productivity app. Generate clear, well-structured content that would fit naturally in a productivity workspace.'
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage
      };
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async summarizeText(text: string, maxLength = 150): Promise<string> {
    const prompt = `Please provide a concise summary of the following text in approximately ${maxLength} characters or less:\n\n${text}`;
    
    try {
      const response = await this.generateContent(prompt, 'Text summarization task');
      return response.content;
    } catch (error) {
      console.error('Summarization error:', error);
      return 'Failed to generate summary';
    }
  }

  async suggestTitle(content: string): Promise<string> {
    const prompt = `Based on this content, suggest a clear and concise title (5-8 words max):\n\n${content.substring(0, 500)}`;
    
    try {
      const response = await this.generateContent(prompt, 'Title suggestion task');
      return response.content.replace(/^["']|["']$/g, '').trim();
    } catch (error) {
      console.error('Title suggestion error:', error);
      return 'Untitled';
    }
  }

  async improveWriting(text: string, instruction?: string): Promise<string> {
    const prompt = instruction 
      ? `Please improve this text according to the instruction: "${instruction}"\n\nText: ${text}`
      : `Please improve the clarity and flow of this text while maintaining its original meaning:\n\n${text}`;
    
    try {
      const response = await this.generateContent(prompt, 'Writing improvement task');
      return response.content;
    } catch (error) {
      console.error('Writing improvement error:', error);
      return text; // Return original text on error
    }
  }

  async generateTemplate(category: string, description: string): Promise<unknown[]> {
    const prompt = `Create a ${category} template with the following requirements: ${description}. 
    
    Return the template as a JSON array of content blocks. Each block should have this structure:
    {
      "id": "unique_id",
      "type": "block_type",
      "content": "block_content",
      "properties": {}
    }
    
    Use these block types: paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item, to_do, quote, divider.
    
    Make sure the content is practical and useful for the specified category.`;
    
    try {
      const response = await this.generateContent(prompt, 'Template generation task');
      
      // Try to parse JSON from the response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create a simple template
      return [{
        id: 'block_' + Date.now(),
        type: 'heading_1',
        content: `${category} Template`,
        properties: {}
      }, {
        id: 'block_' + (Date.now() + 1),
        type: 'paragraph',
        content: description,
        properties: {}
      }];
    } catch (error) {
      console.error('Template generation error:', error);
      return [{
        id: 'block_' + Date.now(),
        type: 'heading_1',
        content: `${category} Template`,
        properties: {}
      }];
    }
  }
}

export const aiClient = new AIClient();