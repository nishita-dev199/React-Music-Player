import React, { useState } from "react";
import { Link } from "react-router-dom";
import { discoverCategories } from "../Shared/discoverData";
import { useMusic } from "../Shared/MusicContext";
import InfiniteRecordRow from "../Components/InfiniteRecordRow";
import AddToPlaylistModal from "../Components/AddToPlaylistModal";

/* ── SVG Icons ── */
const MiniPlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 18 12 6 20 6 4" />
  </svg>
);

const MiniPauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"/>
    <polyline points="7 7 17 7 17 17"/>
  </svg>
);

export default function Feed() {
  const {
    currentSong,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
  } = useMusic();

  // Local categories state to allow instant favorite updates on record players
  const [categories, setCategories] = useState(discoverCategories);

  // Modal and toast state
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2600);
  };

  const handlePlaySong = (song, categorySongs = null) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, categorySongs || categories.flatMap((c) => c.songs));
      showToast(`Now Playing "${song.title}" — synced with Now Playing! 🎶`);
    }
  };

  const handleToggleFavorite = (songId) => {
    toggleFavorite(songId);
    let updatedTitle = "";
    let willBeFavorite = false;

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        songs: cat.songs.map((s) => {
          if (s.id === songId) {
            updatedTitle = s.title;
            willBeFavorite = !s.isFavorite;
            return { ...s, isFavorite: willBeFavorite };
          }
          return s;
        }),
      }))
    );

    showToast(
      willBeFavorite
        ? `Added "${updatedTitle}" to Favourites! ❤️`
        : `Removed "${updatedTitle}" from Favourites`
    );
  };

  const handleScrollToCategory = (catId) => {
    const el = document.getElementById(catId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative min-h-full w-full space-y-8 text-white pb-32">
      {/* ── Multi-Shaded Orange Wave in the LEFT TOP CORNER ── */}
      <svg
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Base Teal */}
        <rect width="1440" height="900" fill="#144d55" />

        {/* Multi-layered organic orange wave bands in LEFT TOP CORNER */}
        <path d="M 0 600 C 350 480 700 300 840 0 L 0 0 Z" fill="#962112" opacity="0.9" />
        <path d="M 0 520 C 300 420 620 250 720 0 L 0 0 Z" fill="#b82d1b" opacity="0.95" />
        <path d="M 0 440 C 250 360 520 200 600 0 L 0 0 Z" fill="#cf3420" />
        <path d="M 0 360 C 200 290 420 160 480 0 L 0 0 Z" fill="#e8412b" />
        <path d="M 0 280 C 150 220 320 120 360 0 L 0 0 Z" fill="#f05742" />
        <path d="M 0 200 C 100 150 220 80 240 0 L 0 0 Z" fill="#f57665" />
      </svg>

      {/* Content wrapper */}
      <div className="relative z-10 space-y-8 w-full">
        {/* ── Discover Header Banner (Padded cleanly to respect floating dock) ── */}
        <div className="px-6 sm:px-12 md:px-20 pt-6">
          <div className="relative overflow-hidden rounded-3xl bg-black/35 backdrop-blur-xl p-6 sm:p-8 border-2 border-[#e8412b]/60 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(232,65,43,0.3)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-2 flex items-center gap-2.5">
                <span>Discover Vinyl Records</span>
                <span>🎧</span>
              </h1>

              <p className="text-sm text-white/85 mt-1 max-w-xl leading-relaxed">
                Experience the authentic sound of vinyl records across curated categories. 
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/"
                className="bg-[#e8412b] hover:bg-[#d93822] border-2 border-white/30 px-5 py-3 rounded-2xl shadow-[0_0_25px_rgba(232,65,43,0.8)] text-center flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Go to Now Playing"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <div className="text-left">
                  <span className="block text-xs font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <span>{isPlaying ? "Vinyl Spinning" : "Open Player"}</span>
                    <ArrowUpRightIcon />
                  </span>
                  <span className="text-[10px] text-white/80 font-bold">Now Playing Page</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Category Jumper Tabs (Padded) ── */}
        <div className="px-6 sm:px-12 md:px-20">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleScrollToCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black bg-black/35 hover:bg-[#e8412b] border border-white/15 hover:border-white/40 text-white/90 hover:text-white transition-all hover:scale-105 active:scale-95 shadow whitespace-nowrap"
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 5 Rows of Infinite Horizontal Record Players with Gap ── */}
        <div className="space-y-12 sm:space-y-16 w-full my-8">
          {categories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="w-full"
            >
              <InfiniteRecordRow
                category={category}
                playingSongId={currentSong?.id}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onToggleFavorite={handleToggleFavorite}
                onAddToPlaylist={(song) => setPlaylistModalSong(song)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating Now Playing Vinyl Bar (When Audio Is Active) ── */}
      {currentSong && (
        <div className="fixed bottom-20 md:bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#103d44]/95 backdrop-blur-2xl border-2 border-[#e8412b] rounded-full px-5 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(232,65,43,0.6)] flex items-center gap-4 text-white max-w-lg w-[90%] sm:w-auto animate-fadeIn">
          {/* Spinning Mini Vinyl */}
          <Link
            to="/"
            className="flex items-center gap-3 group/bar cursor-pointer min-w-0"
            title="Open in Now Playing"
          >
            <div
              className={`w-10 h-10 rounded-full vinyl-grooves relative flex items-center justify-center shrink-0 border border-white/30 shadow-md ${
                isPlaying ? "spin-vinyl" : "spin-vinyl spin-paused"
              }`}
            >
              <div className="w-4 h-4 rounded-full overflow-hidden border border-black/80">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Song info */}
            <div className="min-w-0 flex-1 truncate">
              <div className="text-xs font-black truncate group-hover/bar:text-orange-300 transition-colors flex items-center gap-1.5">
                <span>{currentSong.title}</span>
                <span className="text-[10px] text-white/50">↗</span>
              </div>
              <div className="text-[10px] text-white/70 truncate">{currentSong.artist}</div>
            </div>
          </Link>

          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#e8412b] hover:bg-[#d93822] text-white flex items-center justify-center shadow-[0_0_12px_rgba(232,65,43,0.8)] transition-all hover:scale-105 active:scale-95 shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <MiniPauseIcon /> : <MiniPlayIcon />}
          </button>
        </div>
      )}

      {/* ── Add to Playlist Modal ── */}
      {playlistModalSong && (
        <AddToPlaylistModal
          song={playlistModalSong}
          onClose={() => setPlaylistModalSong(null)}
          onToast={showToast}
        />
      )}

      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 bg-[#e8412b] text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(232,65,43,0.8)] border border-white/30 flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
