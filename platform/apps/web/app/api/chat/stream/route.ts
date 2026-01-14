import { NextRequest } from 'next/server';

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

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    // Stream the response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('Stream read error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    // Return error as SSE
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        const errorData = JSON.stringify({
          error: 'ขออภัยครับ ขณะนี้ระบบ AI ไม่สามารถเชื่อมต่อได้',
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      },
    });

    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
