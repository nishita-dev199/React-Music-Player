import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMusic } from "../Shared/MusicContext";

/* ── SVG Icons ── */
const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5" />
    <rect x="14" y="4" width="4" height="16" rx="1.5" />
  </svg>
);

const PrevIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const NextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const HeartIcon = ({ filled, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#e8412b" : "none"}
    stroke={filled ? "#e8412b" : "currentColor"}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform active:scale-125"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SpotifyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1db954">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 9.5c3-0.5 6 0 8 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M7.5 12.5c3.2-0.4 6 0.2 8.5 1.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M8 15.5c2.5-0.3 5 0.2 7 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

export default function BottomPlayerBar() {
  const location = useLocation();
  const progressBarRef = useRef(null);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleFavorite,
    isSpotifyConnected,
  } = useMusic();

  // Hide mini player on the full-screen Now Playing Turntable page
  const isFullPlayerPage = location.pathname === "/" || location.pathname === "/player";
  if (isFullPlayerPage || !currentSong) return null;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    seek(pct * duration);
  };

  const spotifyTargetUrl =
    currentSong.spotifyUrl ||
    `https://open.spotify.com/search/${encodeURIComponent(
      `${currentSong.title} ${currentSong.artist}`
    )}`;

  return (
    <div
      className={`
        /* ── Fixed Positioning ── */
        fixed z-30 select-none
        left-0 right-0
        /* Mobile: anchored directly above the mobile bottom nav */
        bottom-16 sm:bottom-18 h-16
        /* Desktop: anchored across the bottom of the screen */
        md:bottom-0 md:h-20
        /* Glassmorphism styling */
        bg-[#07191d]/95 backdrop-blur-2xl
        border-t border-white/15
        shadow-[0_-8px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(37,133,145,0.2)]
        transition-all duration-300
      `}
      aria-label="Spotify Playback Bar"
    >
      {/* ── Top Micro Progress Line (Mobile & Desktop) ── */}
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        className="absolute -top-1 left-0 right-0 h-1.5 bg-black/40 hover:h-2.5 transition-all cursor-pointer group"
      >
        <div
          className="h-full bg-gradient-to-r from-[#1db954] via-[#258591] to-[#e8412b] relative transition-all"
          style={{ width: `${progressPct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="h-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3">
        {/* ── LEFT SECTION: Song Details & Album Art ── */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[40%] sm:max-w-[32%] md:max-w-[30%]">
          {/* Album Artwork with subtle vinyl spin when playing */}
          <Link
            to="/player"
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md group/art block cursor-pointer"
            title="Open Now Playing Turntable"
          >
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105 ${
                isPlaying ? "animate-spin-slow" : ""
              }`}
            />
            {/* Center vinyl spindle effect */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-black/80 border border-white/40" />
            </div>
          </Link>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <Link
              to="/player"
              className="text-xs sm:text-sm font-black text-white hover:text-orange-300 transition-colors truncate block drop-shadow"
              title={currentSong.title}
            >
              {currentSong.title}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] shrink-0 animate-pulse" />
              <span className="text-[11px] text-white/75 truncate font-medium">
                {currentSong.artist}
              </span>
            </div>
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0"
            title={currentSong.isFavorite ? "Remove from Favourites" : "Add to Favourites"}
          >
            <HeartIcon filled={currentSong.isFavorite} size={17} />
          </button>
        </div>

        {/* ── CENTER SECTION: Audio Controls & Scrubber ── */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-[500px]">
          {/* Main Controls Row */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Spotify Indicator Badge / Link */}
            <a
              href={spotifyTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1db954]/15 hover:bg-[#1db954]/30 border border-[#1db954]/40 text-[#1db954] hover:text-white text-[11px] font-bold transition-all shadow-sm"
              title="Listen or Open on Spotify"
            >
              <SpotifyIcon size={14} />
              <span>{isSpotifyConnected ? "Spotify ✓" : "Spotify"}</span>
            </a>

            {/* Previous Track */}
            <button
              onClick={playPrev}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Previous Track"
            >
              <PrevIcon />
            </button>

            {/* Play / Pause Main Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#2d8a95] to-[#e8412b] hover:from-[#359aa6] hover:to-[#f0503a] text-white flex items-center justify-center shadow-[0_0_18px_rgba(232,65,43,0.7)] hover:scale-105 active:scale-95 transition-all border border-white/30"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>

            {/* Next Track */}
            <button
              onClick={playNext}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Next Track"
            >
              <NextIcon />
            </button>

            {/* Expand to Full Turntable View */}
            <Link
              to="/player"
              className="p-1.5 sm:p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all hidden sm:block"
              title="Full Turntable Record Player"
            >
              <ExpandIcon />
            </Link>
          </div>

          {/* Desktop Scrubber Timestamp & Bar */}
          <div className="hidden md:flex items-center gap-2.5 w-full mt-1">
            <span className="text-[10px] text-white/60 font-semibold w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleProgressBarClick}
              className="relative flex-1 h-1 bg-white/20 hover:h-1.5 rounded-full overflow-hidden cursor-pointer transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-[#1db954] to-[#e8412b] rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-white/60 font-semibold w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ── RIGHT SECTION: Volume & Spotify Quick Link ── */}
        <div className="hidden sm:flex items-center justify-end gap-3 min-w-0 max-w-[28%] md:max-w-[25%]">
          {/* Direct Spotify Button (Visible on tablet/mobile) */}
          <a
            href={spotifyTargetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex lg:hidden items-center gap-1.5 px-2 py-1 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#1db954] hover:text-white text-xs font-bold transition-all"
            title="Open on Spotify"
          >
            <SpotifyIcon size={15} />
            <span className="text-[10px]">Spotify</span>
          </a>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all shrink-0"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-16 md:w-24 h-1 bg-white/20 accent-[#e8412b] rounded-full cursor-pointer hover:accent-[#1db954] transition-all"
              title={`Volume ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
