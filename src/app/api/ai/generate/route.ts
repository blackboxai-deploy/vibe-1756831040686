import { NextRequest, NextResponse } from 'next/server';

const AI_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const DEFAULT_MODEL = 'openrouter/anthropic/claude-sonnet-4';

const AI_HEADERS = {
  'CustomerId': 'cus_S16jfiBUH2cc7P',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, type = 'content' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build system prompt based on type
    let systemPrompt = '';
    switch (type) {
      case 'continue':
        systemPrompt = 'You are a helpful AI assistant for a Notion-like productivity app. Continue writing based on the provided context. Write naturally and maintain the same tone and style.';
        break;
      case 'summarize':
        systemPrompt = 'You are a helpful AI assistant. Provide a clear and concise summary of the given content. Focus on the main points and key information.';
        break;
      case 'improve':
        systemPrompt = 'You are a helpful writing assistant. Improve the given text while maintaining its original meaning. Make it clearer, more engaging, and better structured.';
        break;
      case 'title':
        systemPrompt = 'You are a helpful AI assistant. Generate a clear, concise title (5-8 words max) based on the provided content. Return only the title without quotes.';
        break;
      case 'template':
        systemPrompt = 'You are a helpful AI assistant for a Notion-like productivity app. Generate a practical template based on the requirements. Return a JSON array of content blocks.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant for a Notion-like productivity app. Generate clear, well-structured content that would fit naturally in a productivity workspace.';
    }

    const messages = [
      {
        role: 'system',
        content: context ? `${systemPrompt} Context: ${context}` : systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: AI_HEADERS,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        max_tokens: type === 'title' ? 50 : 1000,
        temperature: type === 'title' ? 0.3 : 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API Error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    const content = data.choices[0]?.message?.content || '';
    
    return NextResponse.json({
      content: content.trim(),
      usage: data.usage,
      model: DEFAULT_MODEL
    });

  } catch (error) {
    console.error('AI API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'AI service available',
    model: DEFAULT_MODEL,
    endpoint: AI_ENDPOINT
  });
}