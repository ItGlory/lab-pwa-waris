import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://waris-api:8000';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
  context?: string;
  model?: string;
  provider?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat completion error:', error);
    // Return mock response if backend unavailable
    return NextResponse.json({
      message: 'ขออภัยครับ ขณะนี้ระบบ AI ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง',
      role: 'assistant',
      model: null,
      provider: null,
    });
  }
}
