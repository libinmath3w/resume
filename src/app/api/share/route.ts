import { NextRequest } from 'next/server';

// Store active sessions with their content
const activeSessions: Record<string, { content: string, connections: Set<any> }> = {};

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { sessionId, content, action } = data;

  // Handle creating a new session
  if (action === 'create' && !sessionId) {
    const newSessionId = generateSessionId();
    activeSessions[newSessionId] = { 
      content: content || '', 
      connections: new Set() 
    };
    return new Response(JSON.stringify({ sessionId: newSessionId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle updating content in a session
  if (action === 'update' && sessionId) {
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].content = content;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Handle getting content from a session
  if (action === 'get' && sessionId) {
    if (activeSessions[sessionId]) {
      return new Response(JSON.stringify({ content: activeSessions[sessionId].content }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Helper function to generate a random session ID
function generateSessionId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 