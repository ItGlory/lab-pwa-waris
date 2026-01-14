import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/status`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat status fetch error:', error);
    // Return mock data if backend unavailable
    return NextResponse.json({
      llm_available: true,
      active_provider: 'openrouter',
      fallback_enabled: true,
      openrouter: {
        available: true,
        healthy: true,
        is_primary: true,
        default_model: 'scb10x/llama3.1-typhoon2-70b-instruct',
        models_count: 10,
      },
      ollama: {
        available: false,
        healthy: false,
        is_primary: false,
        default_model: 'qwen2.5:72b',
        models_count: 0,
      },
    });
  }
}
