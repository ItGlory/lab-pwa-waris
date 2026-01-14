import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/models`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat models fetch error:', error);
    // Return mock data if backend unavailable
    return NextResponse.json({
      success: true,
      data: {
        openrouter: [
          {
            id: 'scb10x/llama3.1-typhoon2-70b-instruct',
            name: 'Typhoon 2 70B (Thai)',
            context_length: 128000,
          },
          {
            id: 'qwen/qwen-2.5-72b-instruct',
            name: 'Qwen 2.5 72B',
            context_length: 131072,
          },
          {
            id: 'meta-llama/llama-3.1-70b-instruct',
            name: 'Llama 3.1 70B',
            context_length: 131072,
          },
        ],
        ollama: [],
      },
    });
  }
}
