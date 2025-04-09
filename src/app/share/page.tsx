"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import "./share.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    updateContentTimeout?: NodeJS.Timeout;
  }
}

// Client component that safely uses useSearchParams inside
function ShareContent() {
  const [content, setContent] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEscHint, setShowEscHint] = useState(false);
  const [origin, setOrigin] = useState("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set the origin on client-side only
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Poll for updates
  const startPolling = (id: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 1 second
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
            sessionId: id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Only update if content is different to avoid cursor jumping
          if (data.content !== contentRef.current) {
            // Store current cursor position
            if (document.activeElement instanceof HTMLTextAreaElement && 
                document.activeElement.className === "editor-area") {
              const textarea = document.activeElement;
              const cursorPos = textarea.selectionStart;
              
              // Update content
              setContent(data.content);
              contentRef.current = data.content;
              
              // Restore cursor position after React updates the DOM
              setTimeout(() => {
                if (document.activeElement === textarea) {
                  textarea.selectionStart = cursorPos;
                  textarea.selectionEnd = cursorPos;
                }
              }, 0);
            } else {
              // No active textarea, just update content
              setContent(data.content);
              contentRef.current = data.content;
            }
          }
          // Only change connection status to connected if currently disconnected
          // This prevents flickering when updating content
          if (connectionStatus !== "connected") {
            setConnectionStatus("connected");
          }
        } else {
          // Don't immediately disconnect on a single error
          console.error("Failed to get updates, will retry");
          
          // Only show disconnect after multiple failures
          if (connectionStatus === "errorWarning") {
            setConnectionStatus("disconnected");
            setError("Failed to get updates");
          } else if (connectionStatus === "connected") {
            // Set to warning state but don't show disconnected yet
            setConnectionStatus("errorWarning");
          }
        }
      } catch (error) {
        console.error("Error in polling:", error);
        
        // Only show disconnect after multiple failures
        if (connectionStatus === "errorWarning") {
          setConnectionStatus("disconnected");
          setError("Failed to connect to server");
        } else if (connectionStatus === "connected") {
          // Set to warning state but don't show disconnected yet
          setConnectionStatus("errorWarning");
        }
      }
    }, 1000);
  };

  // Add a heartbeat function to keep the session alive
  const startHeartbeat = (id: string) => {
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch("/api/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "heartbeat",
            sessionId: id,
          }),
        });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000); // Send heartbeat every 30 seconds

    return heartbeatInterval;
  };

  // Add a ref for the heartbeat interval
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Store session data in localStorage
  const saveSessionToLocalStorage = (id: string, textContent: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codeshare_session", JSON.stringify({
        sessionId: id,
        content: textContent,
        timestamp: Date.now()
      }));
    }
  };

  // Load session from localStorage
  const loadSessionFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem("codeshare_session");
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          // Only use saved session if it's less than 24 hours old
          if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            return session;
          } else {
            localStorage.removeItem("codeshare_session");
          }
        } catch (e) {
          localStorage.removeItem("codeshare_session");
        }
      }
    }
    return null;
  };

  // Function to create a new sharing session
  const createNewSession = async () => {
    setIsLoading(true);
    setError("");
    setConnectionStatus("connecting");

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          content: "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setContent("");
        contentRef.current = "";
        
        // Save to localStorage
        saveSessionToLocalStorage(data.sessionId, "");
        
        // Update URL with the session ID
        router.push(`/share?session=${data.sessionId}`);
        
        // Start polling for updates
        startPolling(data.sessionId);
        
        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = startHeartbeat(data.sessionId);
        
        setConnectionStatus("connected");
      } else {
        setError("Failed to create session");
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      setError("Failed to connect to server");
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to join an existing session
  const joinSession = async (id: string) => {
    if (!id) {
      setError("Please enter a session ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setConnectionStatus("connecting");

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get",
          sessionId: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(id);
        setContent(data.content);
        contentRef.current = data.content;
        
        // Save to localStorage
        saveSessionToLocalStorage(id, data.content);
        
        // Update URL with the session ID
        router.push(`/share?session=${id}`);
        
        // Start polling for updates
        startPolling(id);
        
        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = startHeartbeat(id);
        
        setConnectionStatus("connected");
        setShowJoinInput(false);
      } else {
        setError("Session not found");
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      setError("Failed to connect to server");
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle content changes with improved error handling and debouncing
  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    contentRef.current = newContent;

    // Save updated content to localStorage immediately
    if (sessionId) {
      saveSessionToLocalStorage(sessionId, newContent);
    }

    // Debounced update to the server to prevent frequent API calls while typing
    if (sessionId) {
      // Use debouncing to prevent too many API calls while typing quickly
      if (window.updateContentTimeout) {
        clearTimeout(window.updateContentTimeout);
      }
      
      window.updateContentTimeout = setTimeout(async () => {
        try {
          const response = await fetch("/api/share", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "update",
              sessionId,
              content: newContent,
            }),
          });
          
          if (!response.ok) {
            console.error("Failed to update content, status:", response.status);
          }
        } catch (error) {
          console.error("Failed to update content:", error);
          // Don't change connection status here - let the polling handle connection status
        }
      }, 300); // Wait 300ms after typing stops before sending update
    }
  };

  // Copy session URL to clipboard
  const copySessionUrl = () => {
    if (!origin) return;
    const url = `${origin}/share?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Session URL copied to clipboard!");
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    // Show ESC key hint when entering fullscreen
    if (newFullscreenState) {
      setShowEscHint(true);
      // Hide the hint after 3 seconds
      setTimeout(() => {
        setShowEscHint(false);
      }, 3000);
    }
  };

  // In the component's useEffect, add code to check localStorage for a saved session
  useEffect(() => {
    // First check URL param
    const sessionParam = searchParams.get("session");
    if (sessionParam) {
      joinSession(sessionParam);
      return;
    }
    
    // If no URL param, check localStorage
    const savedSession = loadSessionFromLocalStorage();
    if (savedSession && savedSession.sessionId) {
      joinSession(savedSession.sessionId);
    }

    return () => {
      // Clean up all intervals when component unmounts
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [searchParams]);

  // Add ESC key handler to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <main className={`min-h-screen flex flex-col ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {!isFullscreen && <Header />}

      <section className={`py-6 md:py-10 flex flex-col flex-grow relative ${isFullscreen ? 'p-0' : ''}`}>
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-gray-light/30"></div>

        <div className={`container-custom mx-auto px-4 flex flex-col flex-grow ${isFullscreen ? 'max-w-none p-0 m-0' : ''}`}>
          <div className={`max-w-5xl mx-auto w-full mb-6 text-center transition-opacity ${isFullscreen ? 'opacity-0 absolute -z-50' : 'opacity-100'}`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient-pink">
              CodeShare
            </h1>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Share code and text in real-time with anyone. Create a session and share the link.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/infinite')}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow-md border border-indigo-700 hover:bg-indigo-700 transition-all duration-200 text-sm inline-flex items-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Infinite</span>
              </button>
            </div>
          </div>

          <div 
            className={`share-container ${isFullscreen ? 'fullscreen-container' : 'max-w-5xl'} mx-auto w-full p-4 bg-background/50 backdrop-blur-sm rounded-lg shadow-md border border-foreground/10 ${isFullscreen ? 'h-screen rounded-none border-0' : ''}`}
            ref={editorContainerRef}
          >
            <div className={`flex items-center justify-between mb-3 ${isFullscreen ? 'px-4 py-2' : ''}`}>
              <div className="connection-status">
                <div className={`status-indicator ${connectionStatus}`}></div>
                <span>
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white shadow-md border border-indigo-700 hover:bg-indigo-500 transition-all duration-200 text-sm flex items-center gap-1.5"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isFullscreen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 9L4 4m0 0l5 0M4 4v5m11-5h5m0 0v5m0-5l-5 5M9 20l-5-5m0 0v5m0-5h5m11 5l-5-5m0 0h5m0 0v5"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  )}
                </svg>
                <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              </button>
            </div>

            <div className={`transition-all duration-300 ${isFullscreen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              {sessionId ? (
                <div className="session-info">
                  <span>Session:</span>
                  <div className="session-id">{sessionId}</div>
                  <button onClick={copySessionUrl} className="copy-button">
                    Copy Link
                  </button>
                </div>
              ) : (
                <div className="controls">
                  <button
                    onClick={createNewSession}
                    disabled={isLoading}
                    className="new-session-button"
                  >
                    Create New Session
                  </button>
                  {showJoinInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={joinSessionId}
                        onChange={(e) => setJoinSessionId(e.target.value)}
                        placeholder="Enter session ID"
                        className="px-3 py-2 rounded-md border border-foreground/20 bg-background/80"
                      />
                      <button
                        onClick={() => joinSession(joinSessionId)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                      >
                        Join
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowJoinInput(true)}
                      className="px-4 py-2 border border-foreground/20 rounded-md hover:bg-foreground/10"
                    >
                      Join Existing Session
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className={`mb-4 ${isFullscreen ? 'mt-0' : 'mt-4'} p-3 rounded-lg bg-red-50 text-red-600 border border-red-200`}>
                <p>{error}</p>
              </div>
            )}

            <div className={`editor-container ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'mt-4'}`}>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder={
                    sessionId
                      ? "Start typing here... Everyone in this session will see what you type in real-time."
                      : "Create or join a session to start sharing text in real-time."
                  }
                  className="editor-area"
                  disabled={!sessionId}
                />
              )}
            </div>

            {/* Floating controls for fullscreen mode */}
            {isFullscreen && (
              <>
                {/* ESC Key hint */}
                {showEscHint && (
                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-900/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg border border-white/20 flex items-center gap-2 animate-fade-in-up">
                    <kbd className="px-2 py-1 bg-indigo-700 rounded text-xs font-semibold border border-indigo-500">ESC</kbd>
                    <span>Press ESC key to exit fullscreen</span>
                  </div>
                )}

                {sessionId && (
                  <div className="fixed top-4 left-4 z-50 session-pill px-3 py-1.5 rounded-full bg-indigo-900/70 backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-2">
                    <span className="text-white text-sm">Session: {sessionId}</span>
                    <button 
                      onClick={copySessionUrl} 
                      className="p-1 rounded-full bg-indigo-700/80 hover:bg-indigo-600 shadow-lg transition-all flex items-center justify-center text-white"
                      title="Copy link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}

            <div className={`mt-8 ${isFullscreen ? 'hidden' : 'block'}`}>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                About CodeShare
              </h3>
              <p className="text-foreground/80 mb-3">
                CodeShare allows you to share text and code snippets in real-time.
                Here's how it works:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                <li>Create a new session or join an existing one</li>
                <li>Share the session link with others</li>
                <li>Everyone connected to the session can edit the text in real-time</li>
                <li>Changes are synchronized across all connected browsers</li>
                <li>Perfect for collaborative coding, note-taking, or quick sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {!isFullscreen && (
        <>
          <Footer />
          <ScrollToTop />
        </>
      )}
      <Analytics />

      <style jsx>{`
        .fullscreen-mode {
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }

        .fullscreen-container {
          max-width: 100%;
          height: 100vh;
          border-radius: 0;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .session-pill {
          max-width: 300px;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}

// Main page component that uses Suspense to handle async operations
export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
} 