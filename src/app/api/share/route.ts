import { NextRequest } from 'next/server';

// Use a more global scope object to store sessions (will persist across API calls)
// In a production app, you would use a database
let globalSessions: Record<string, { 
  content: string, 
  connections: Set<any>,
  lastAccessed: number 
}> = {};

// Remove sessions after 24 hours of inactivity
const SESSION_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Clean up old sessions every hour
if (typeof process !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(globalSessions).forEach(sessionId => {
      if (now - globalSessions[sessionId].lastAccessed > SESSION_LIFETIME) {
        delete globalSessions[sessionId];
      }
    });
  }, 60 * 60 * 1000); // Run every hour
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { sessionId, content, action } = data;

  // Handle creating a new session
  if (action === 'create' && !sessionId) {
    const newSessionId = generateSessionId();
    globalSessions[newSessionId] = { 
      content: content || '', 
      connections: new Set(),
      lastAccessed: Date.now()
    };
    return new Response(JSON.stringify({ sessionId: newSessionId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Handle updating content in a session
  if (action === 'update' && sessionId) {
    if (globalSessions[sessionId]) {
      globalSessions[sessionId].content = content;
      globalSessions[sessionId].lastAccessed = Date.now();
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

  // Handle heartbeat to keep session alive
  if (action === 'heartbeat' && sessionId) {
    if (globalSessions[sessionId]) {
      globalSessions[sessionId].lastAccessed = Date.now();
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
    if (globalSessions[sessionId]) {
      globalSessions[sessionId].lastAccessed = Date.now();
      return new Response(JSON.stringify({ content: globalSessions[sessionId].content }), {
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