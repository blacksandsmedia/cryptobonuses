import { NextRequest } from 'next/server';
import { connections } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  // Real-time Server-Sent Events for instant notifications
  const stream = new ReadableStream({
    start(controller) {
      // Add connection to active set
      connections.add(controller);
      
      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'Notification stream connected' })}\n\n`);
      
      console.log(`[SSE] New client connected. Total connections: ${connections.size}`);
      
      // Set up periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          connections.delete(controller);
        }
      }, 30000); // Every 30 seconds
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(controller);
        console.log(`[SSE] Client disconnected. Total connections: ${connections.size}`);
      });
    },
    
    cancel() {
      // This will be called when the client disconnects
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
} 