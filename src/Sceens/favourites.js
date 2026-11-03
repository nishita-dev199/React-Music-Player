import React from "react";
import { Link } from "react-router-dom";
import { useMusic } from "../Shared/MusicContext";
import SongCard from "../Components/SongCard";

/* ── SVG Icons ── */
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
  </svg>
);

export default function Favourites() {
  const { songs, currentSong, isPlaying, playTrack, togglePlay, toggleFavorite } = useMusic();
  const favorites = songs.filter((song) => song.isFavorite);

  const isFavoritePlaying = favorites.some((s) => s.id === currentSong?.id) && isPlaying;

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, favorites);
    }
  };

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    if (isFavoritePlaying) {
      togglePlay();
    } else {
      // If current song is in favorites, resume or play it; otherwise start with first favorite
      const target = favorites.find((s) => s.id === currentSong?.id) || favorites[0];
      playTrack(target, favorites);
    }
  };

  return (
    <div className="relative min-h-full max-w-7xl mx-auto space-y-6 text-white pb-10">
      {/* ── Multi-Shaded Orange Wave in the RIGHT BOTTOM CORNER ── */}
      <svg
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Base Teal */}
        <rect width="1440" height="900" fill="#144d55" />

        {/* Multi-layered organic orange wave bands in RIGHT BOTTOM CORNER */}
        <path d="M 540 900 C 820 650 1090 400 1440 350 L 1440 900 Z" fill="#962112" opacity="0.9" />
        <path d="M 680 900 C 920 700 1140 480 1440 440 L 1440 900 Z" fill="#b82d1b" opacity="0.95" />
        <path d="M 810 900 C 1010 740 1200 560 1440 530 L 1440 900 Z" fill="#cf3420" />
        <path d="M 940 900 C 1090 790 1260 640 1440 620 L 1440 900 Z" fill="#e8412b" />
        <path d="M 1060 900 C 1170 830 1310 720 1440 710 L 1440 900 Z" fill="#f05742" />
        <path d="M 1180 900 C 1260 860 1360 810 1440 800 L 1440 900 Z" fill="#f57665" />
      </svg>

      {/* Content wrapper */}
      <div className="relative z-10 space-y-6">
        {/* Header Banner with Orange Border */}
        <div className="relative overflow-hidden rounded-3xl bg-black/30 backdrop-blur-xl p-6 sm:p-8 border-2 border-[#e8412b]/60 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(232,65,43,0.3)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-orange-300 uppercase bg-[#e8412b]/30 px-3 py-1 rounded-full border border-[#e8412b]/50">
              Saved Collection
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-2 flex items-center gap-3">
              <span>Your Favourites</span>
              <span className="text-3xl text-[#e8412b] drop-shadow">❤️</span>
            </h1>
            <p className="text-sm text-white/90 mt-1 max-w-md">
              All the songs you love and cherish, ready to stream instantly
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            {favorites.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 bg-[#e8412b] hover:bg-[#d93822] text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(232,65,43,0.8)] border border-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title={isFavoritePlaying ? "Pause Favourites" : "Play All Favourites"}
              >
                {isFavoritePlaying ? <PauseIcon /> : <PlayIcon />}
                <span>{isFavoritePlaying ? "Pause Favourites" : "Play All"}</span>
              </button>
            )}

            <Link
              to="/player"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/20 transition-all hover:scale-105 shadow-md"
              title="Open Now Playing"
            >
              <span>Now Playing ↗</span>
            </Link>

            <div className="bg-[#e8412b] border-2 border-white/30 px-5 py-2 rounded-2xl shadow-[0_0_25px_rgba(232,65,43,0.8)] text-center min-w-[70px]">
              <span className="block text-2xl font-black text-white">{favorites.length}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90">Favorites</span>
            </div>
          </div>
        </div>

        {/* Grid of Favorites with Orange Card Borders */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((song) => (
              <div key={song.id} className="rounded-2xl border-2 border-[#e8412b]/40 hover:border-[#e8412b] transition-all shadow-md">
                <SongCard
                  song={song}
                  onPlay={handlePlay}
                  onFavorite={() => toggleFavorite(song.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/35 border-2 border-[#e8412b]/60 rounded-3xl p-12 text-center text-white/80 space-y-4 max-w-md mx-auto mt-8 shadow-2xl backdrop-blur-md">
            <div className="text-6xl text-[#e8412b]">🧡</div>
            <h3 className="text-xl font-black text-white">No favorites yet</h3>
            <p className="text-sm text-white/70">
              Tap the heart icon on any track to save your favorites here for quick listening.
            </p>
            <Link
              to="/library"
              className="inline-block px-7 py-3 rounded-full bg-[#e8412b] hover:bg-[#d93822] text-white text-xs font-black shadow-[0_0_20px_rgba(232,65,43,0.8)] transition-all hover:scale-105 border border-white/20"
            >
              Explore Library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
