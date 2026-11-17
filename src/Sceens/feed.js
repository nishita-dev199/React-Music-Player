import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { discoverCategories } from "../Shared/discoverData";
import { useMusic } from "../Shared/MusicContext";
import InfiniteRecordRow from "../Components/InfiniteRecordRow";
import AddToPlaylistModal from "../Components/AddToPlaylistModal";

/* ── SVG Icons ── */
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
    favoriteIds,
    spotifySongs,
    apiSongs,
    isSpotifyConnected,
  } = useMusic();

  // Live Spotify & unified API songs list
  const liveSpotifySongs = useMemo(() => {
    const list =
      spotifySongs && spotifySongs.length > 0
        ? spotifySongs
        : apiSongs && apiSongs.length > 0
        ? apiSongs
        : [];
    return list;
  }, [spotifySongs, apiSongs]);

  // Construct complete categories with Spotify Top Hits as the premiere top row
  const categories = useMemo(() => {
    const allCategories = [];

    // 1. Spotify Top Hits & Trending Category
    if (liveSpotifySongs.length > 0) {
      allCategories.push({
        id: "spotify-hits",
        title: "Spotify Top Hits & Trending",
        subtitle: isSpotifyConnected
          ? "Your connected Spotify account chartbusters & live streaming vinyls"
          : "Global Spotify chartbusters & live streaming vinyls",
        icon: "🟢",
        tag: "Spotify Live",
        songs: liveSpotifySongs.slice(0, 12).map((s) => ({
          ...s,
          isFavorite: favoriteIds ? favoriteIds.includes(s.id) : Boolean(s.isFavorite),
        })),
      });
    }

    // 2. Curated Discover Categories with favorite flags synced
    discoverCategories.forEach((cat) => {
      allCategories.push({
        ...cat,
        songs: cat.songs.map((s) => ({
          ...s,
          isFavorite: favoriteIds ? favoriteIds.includes(s.id) : Boolean(s.isFavorite),
        })),
      });
    });

    return allCategories;
  }, [liveSpotifySongs, isSpotifyConnected, favoriteIds]);

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
      const queue = categorySongs || categories.flatMap((c) => c.songs);
      playTrack(song, queue);
      showToast(`Now Playing "${song.title}" — synced with Now Playing! 🎶`);
    }
  };

  const handleToggleFavorite = (songId) => {
    toggleFavorite(songId);
    const isCurrentlyFav = favoriteIds ? favoriteIds.includes(songId) : false;
    const allSongs = categories.flatMap((c) => c.songs);
    const song = allSongs.find((s) => s.id === songId);
    const title = song?.title || "Track";

    showToast(
      !isCurrentlyFav
        ? `Added "${title}" to Favourites! ❤️`
        : `Removed "${title}" from Favourites`
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 text-[#1db954] text-xs font-bold mb-2">
                <span>🟢</span>
                <span>{isSpotifyConnected ? "Spotify Connected" : "Spotify & Vinyl Integration Active"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1 flex items-center gap-2.5">
                <span>Discover Vinyl Records</span>
                <span>🎧</span>
              </h1>

              <p className="text-sm text-white/85 mt-1 max-w-xl leading-relaxed">
                Experience authentic vinyl records across curated categories and live Spotify chartbusters with synced audio playback.
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
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow whitespace-nowrap ${
                  cat.id === "spotify-hits"
                    ? "bg-[#1db954]/25 hover:bg-[#1db954] border border-[#1db954]/60 text-white"
                    : "bg-black/35 hover:bg-[#e8412b] border border-white/15 hover:border-white/40 text-white/90 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Rows of Infinite Horizontal Record Players with Gap ── */}
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
