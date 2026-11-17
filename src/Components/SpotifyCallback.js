import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSpotifyCallback } from "../lib/spotify";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Spotify...");
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        setStatus("Exchanging credentials with Spotify...");
        await handleSpotifyCallback();
        if (isMounted) {
          setStatus("Connected successfully! Loading your Spotify tracks...");
          setTimeout(() => {
            navigate("/", { replace: true });
            // Optionally reload to let MusicContext pick up the newly stored Spotify token
            window.location.href = "/";
          }, 800);
        }
      } catch (err) {
        console.error("Spotify callback error:", err);
        if (isMounted) {
          setError(err.message || "Failed to connect to Spotify.");
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-white select-none">
      <div className="w-16 h-16 rounded-full bg-[#1db954] flex items-center justify-center text-black mb-4 shadow-[0_0_30px_rgba(29,185,84,0.6)] animate-pulse">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.51 9.722 1.113.294.18.386.562.207.857zm1.223-2.72c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.127-.849-.106-.976-.518-.126-.413.107-.849.518-.976 3.632-1.102 8.147-.568 11.238 1.332.366.226.482.707.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.129-1.165-.623-.15-.493.129-1.016.623-1.165 3.532-1.072 9.404-.866 13.115 1.337.445.264.59.838.327 1.282-.264.443-.838.59-1.283.328z" />
        </svg>
      </div>
      <h2 className="text-xl font-black mb-2">Spotify Integration</h2>
      {error ? (
        <p className="text-sm text-red-400 font-bold max-w-md">{error}</p>
      ) : (
        <p className="text-sm text-white/80 font-semibold">{status}</p>
      )}
    </div>
  );
}

