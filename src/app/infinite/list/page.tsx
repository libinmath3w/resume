"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ScrollToTop from "../../../components/ScrollToTop";
import "./playlist.css";
import { Analytics } from "@vercel/analytics/react";
// Helper function to extract playlist ID from a YouTube playlist URL
const extractPlaylistId = (url: string): string | null => {
  if (!url) return null;

  // Handle various YouTube playlist URL formats
  try {
    // If the URL doesn't start with http/https, add it
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const urlObj = new URL(url);

    // Format: youtube.com/playlist?list=PLAYLIST_ID
    if (url.includes("youtube.com/playlist")) {
      return urlObj.searchParams.get("list");
    }

    // Format: youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
    if (url.includes("youtube.com/watch") && urlObj.searchParams.get("list")) {
      return urlObj.searchParams.get("list");
    }

    // Handle youtu.be short URLs with playlist
    if (url.includes("youtu.be/") && urlObj.searchParams.get("list")) {
      return urlObj.searchParams.get("list");
    }

    // Handle direct playlist ID input (just the ID itself)
    if (/^[A-Za-z0-9_-]{13,}$/.test(url)) {
      return url;
    }

    // Other potential formats
    if (urlObj.searchParams.get("list")) {
      return urlObj.searchParams.get("list");
    }
  } catch (error) {
    console.error("Invalid URL format", error);
    // If URL parsing fails, check if it's a direct playlist ID
    if (/^[A-Za-z0-9_-]{13,}$/.test(url)) {
      return url;
    }
    return null;
  }

  return null;
};

export default function PlaylistPage() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [useAdBlocker, setUseAdBlocker] = useState(true);
  const [showEscHint, setShowEscHint] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playlistUrl) {
      setError("Please enter a YouTube playlist URL");
      return;
    }

    // Add https:// prefix if not present
    let formattedUrl = playlistUrl;
    if (!/^https?:\/\//i.test(playlistUrl)) {
      formattedUrl = `https://${playlistUrl}`;
    }

    setIsLoading(true);
    setError("");

    // Extract playlist ID
    const id = extractPlaylistId(formattedUrl);

    if (id) {
      setPlaylistId(id);
    } else {
      setError(
        "Invalid YouTube playlist URL. Please ensure it contains a 'list=' parameter."
      );
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  // Generate QR code URL for current playlist
  const getQRCodeUrl = () => {
    if (!playlistId) return "";
    const currentUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/infinite/list`
        : "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `${currentUrl}?playlist=${playlistId}`
    )}`;
  };

  // Get the iframe source based on current settings
  const getIframeSource = () => {
    if (!playlistId) return "";

    if (useAdBlocker) {
      // Use our custom API for ad-free experience
      return `/api/playlist?id=${playlistId}`;
    } else {
      // Use standard YouTube embed
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0`;
    }
  };

  // Check for playlist in URL when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clean non-essential URL parameters
      const urlWithoutTrackingParams = window.location.pathname;

      // Check for playlist ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const playlistParam = urlParams.get("playlist");

      if (playlistParam) {
        setPlaylistId(playlistParam);
        // Keep only the playlist parameter in the URL
        window.history.replaceState(
          {},
          document.title,
          `${urlWithoutTrackingParams}?playlist=${playlistParam}`
        );
      } else if (window.location.search) {
        // Remove other parameters
        window.history.replaceState(
          {},
          document.title,
          urlWithoutTrackingParams
        );
      }
    }
  }, []);
  
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
    <main className="min-h-screen flex flex-col">
      <Header />

      <section
        className={`py-6 md:py-10 flex flex-col flex-grow relative ${
          isFullscreen ? "fullscreen-mode" : ""
        }`}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-gray-light/30"></div>

        <div
          className="container-custom mx-auto px-4 flex flex-col flex-grow"
          ref={containerRef}
        >
          <div
            className={`max-w-5xl mx-auto w-full mb-6 text-center transition-opacity ${
              isFullscreen ? "opacity-0 absolute -z-50" : "opacity-100"
            }`}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient-pink">
              YouTube Playlist Player
            </h1>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Play YouTube playlists without ads or interruptions.
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
            className={`playlist-container w-full mx-auto p-4 ${
              isFullscreen ? "fullscreen-container" : "max-w-5xl"
            }`}
          >
            <div
              className={`transition-all duration-300 ${
                isFullscreen ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className="flex flex-col md:flex-row gap-3 mb-5"
              >
                <div className="flex-grow url-input relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-foreground/60"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    placeholder="Enter YouTube playlist URL (e.g., youtube.com/playlist?list=PL...)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-foreground/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 outline-none text-foreground placeholder:text-foreground/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="glow-button px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading..." : "Load Playlist"}
                </button>
              </form>

              {/* Controls row */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                {playlistId && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleQRCode}
                        className="px-3 py-1.5 rounded-md bg-indigo-600 shadow-md border border-indigo-700 hover:bg-indigo-500 transition-all duration-200 text-sm flex items-center gap-1 hover:scale-105 text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                          />
                        </svg>
                        Share
                      </button>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <span className="mr-2 text-sm font-medium text-foreground">
                            Ad Blocker
                          </span>
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={useAdBlocker}
                              onChange={() => {
                                setUseAdBlocker(!useAdBlocker);
                                setIsLoading(true);
                              }}
                            />
                            <div
                              className={`block w-10 h-6 rounded-full transition-colors duration-300 shadow-inner ${
                                useAdBlocker ? "bg-indigo-600" : "bg-gray-500"
                              }`}
                            ></div>
                            <div
                              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${
                                useAdBlocker ? "transform translate-x-4" : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-500 hover:to-purple-500 text-sm flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-indigo-500/30 border border-white/20"
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
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                </button>
              </div>

              {/* QR Code Modal */}
              {showQRCode && playlistId && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                  <div className="bg-background rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl border border-indigo-500/20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Share Playlist</h3>
                      <button
                        onClick={toggleQRCode}
                        className="p-1 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-col items-center">
                      <img
                        src={getQRCodeUrl()}
                        alt="QR Code for playlist"
                        className="w-48 h-48 object-contain mb-4 border p-2 rounded-lg bg-white"
                      />
                      <p className="text-sm text-foreground/80 text-center mb-4">
                        Scan this QR code to open this playlist on another
                        device
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/infinite/list?playlist=${playlistId}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert("Link copied to clipboard!");
                          }}
                          className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={toggleQRCode}
                          className="px-3 py-1.5 rounded-md border border-foreground/20 text-sm hover:bg-foreground/10 transition-colors text-foreground"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div
              className={`iframe-container w-full relative ${
                isFullscreen ? "h-screen" : "h-[75vh] md:h-[80vh]"
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="loading-animation">
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="shadow"></div>
                    <div className="shadow"></div>
                    <div className="shadow"></div>
                    <span>Loading</span>
                  </div>
                </div>
              )}

              {playlistId ? (
                <iframe
                  ref={iframeRef}
                  src={getIframeSource()}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen={true}
                  onLoad={handleIframeLoad}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-foreground/80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 text-red-500/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-lg">
                    Enter a YouTube playlist URL above to start watching
                  </p>
                  <p className="mt-2 text-sm text-foreground/80 max-w-md text-center">
                    Find a playlist on YouTube, copy the URL from the address
                    bar, and paste it here.
                    <br />
                    Make sure it contains "list=" in the URL.
                  </p>
                </div>
              )}

              {/* Floating controls for fullscreen mode */}
              {isFullscreen && (
                <>
                  <div className="fixed top-4 right-4 z-50 flex gap-2 controls-panel px-2 py-1 rounded-full bg-indigo-900/70 backdrop-blur-md shadow-lg border border-white/20">
                    <div className="relative group">
                      <button 
                        onClick={() => router.push('/infinite')}
                        className="p-2 rounded-full bg-indigo-700/80 hover:bg-indigo-600 shadow-lg transition-all flex items-center justify-center text-white"
                        title="Back to Infinite"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">Back to Infinite</div>
                    </div>
                    <div className="relative group">
                      <button 
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full bg-indigo-700/80 hover:bg-indigo-600 shadow-lg transition-all flex items-center justify-center text-white"
                        title="Exit Fullscreen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0M4 4v5m11-5h5m0 0v5m0-5l-5 5M9 20l-5-5m0 0v5m0-5h5m11 5l-5-5m0 0h5m0 0v5" />
                        </svg>
                      </button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">Exit Fullscreen</div>
                    </div>
                  </div>
                  
                  {/* ESC Key hint */}
                  {showEscHint && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-900/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg border border-white/20 flex items-center gap-2 animate-fade-in-up">
                      <kbd className="px-2 py-1 bg-indigo-700 rounded text-xs font-semibold border border-indigo-500">ESC</kbd>
                      <span>Press ESC key to exit fullscreen</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`mt-5 transition-all duration-300 ${
                isFullscreen ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              }`}
            >
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                About YouTube Playlist Player
              </h3>
              <p className="text-foreground/80 mb-3">
                Enjoy YouTube playlists without interruptions. Here's what makes
                this player special:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                <li>No ads or interruptions during playback</li>
                <li>Continuous playback of entire playlists</li>
                <li>Clean, distraction-free interface</li>
                <li>Fullscreen mode for immersive viewing</li>
                <li>Works with any public YouTube playlist</li>
                <li>
                  Built-in ad blocker specifically designed for YouTube videos
                </li>
                <li>Share playlists easily with QR codes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className={isFullscreen ? "hidden" : "block"}>
        <Footer />
        <ScrollToTop />
      </div>

      <style jsx>{`
        .loading-animation {
          width: 100px;
          height: 100px;
          position: relative;
          perspective: 780px;
          transform-style: preserve-3d;
        }

        .loading-animation span {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          color: var(--color-primary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .circle,
        .shadow {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          position: absolute;
          animation: loading 1.8s infinite ease-in-out;
        }

        .circle {
          background: linear-gradient(
            to right,
            var(--color-primary),
            var(--color-secondary)
          );
        }

        .circle:nth-child(1),
        .shadow:nth-child(4) {
          top: 0;
          left: 40px;
          animation-delay: 0s;
        }

        .circle:nth-child(2),
        .shadow:nth-child(5) {
          top: 28px;
          left: 0;
          animation-delay: -0.6s;
        }

        .circle:nth-child(3),
        .shadow:nth-child(6) {
          top: 28px;
          left: 80px;
          animation-delay: -1.2s;
        }

        .shadow {
          background-color: rgba(0, 0, 0, 0.1);
          transform: scale(0.8);
          animation-name: loading-shadow;
        }

        @keyframes loading {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes loading-shadow {
          0%,
          100% {
            transform: scale(0.8);
          }
          50% {
            transform: scale(0.5);
          }
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
        }

        .iframe-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .text-gradient-pink {
          background: linear-gradient(
            to right,
            var(--color-primary),
            var(--color-secondary)
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
      `}</style>
      <Analytics />
    </main>
  );
}
