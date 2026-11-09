import React, { useState, useRef, useEffect, useMemo } from "react";
import { useMusic } from "../Shared/MusicContext";
import AddToPlaylistModal from "../Components/AddToPlaylistModal";

/* ── SVG Icons ── */
const PrevIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20"/>
    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const NextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4"/>
    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
  </svg>
);

const MiniPlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 18 12 6 20 6 4"/>
  </svg>
);

const MiniPauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1"/>
    <rect x="14" y="4" width="4" height="16" rx="1"/>
  </svg>
);

const VolumeIcon = ({ muted, level }) => {
  if (muted || level === 0) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      {level > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>}
    </svg>
  );
};

const SquiggleWave = () => (
  <svg className="w-14 h-4 my-3 text-orange-400 stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 60 16">
    <path d="M2 8 Q 8 1, 14 8 T 26 8 T 38 8 T 50 8 T 58 8" />
  </svg>
);

const SpotifyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 9.5c3-0.5 6 0 8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M7.5 12.5c3.2-0.4 6 0.2 8.5 1.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M8 15.5c2.5-0.3 5 0.2 7 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
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
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlaylistAddIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="16" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
    <line x1="19" y1="16" x2="19" y2="22"/>
    <line x1="16" y1="19" x2="22" y2="19"/>
  </svg>
);

const formatTime = (t) => {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Player() {
  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useMusic();

  // Modal & Toast state
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  };

  // Center item detection for infinite zoom scroll
  const [centerItemIndex, setCenterItemIndex] = useState(1);
  const scrollContainerRef = useRef(null);
  const itemRefs = useRef([]);

  // Dynamic filtering of songs for Up Next Queue based on search & category
  const filteredSongs = useMemo(() => {
    let list = songs;

    if (searchMode === "categories") {
      if (selectedCategory && selectedCategory !== "All") {
        list = list.filter((s) =>
          s.genre?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (s) =>
            s.genre?.toLowerCase().includes(q) ||
            s.title?.toLowerCase().includes(q)
        );
      }
    } else {
      // Songs mode: search titles, artists, albums
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.artist?.toLowerCase().includes(q) ||
            s.album?.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }, [songs, searchMode, selectedCategory, searchQuery]);

  // Tripled list for infinite looping illusion
  const repeatedSongs = useMemo(() => {
    if (filteredSongs.length === 0) return [];
    if (filteredSongs.length === 1) return filteredSongs;
    return [...filteredSongs, ...filteredSongs, ...filteredSongs];
  }, [filteredSongs]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  /* Scroll handling: Infinite loop wrap + Center zoom calculation */
  const handleQueueScroll = () => {
    if (!scrollContainerRef.current || repeatedSongs.length <= 1) return;
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    const singleSetHeight = filteredSongs.length * 75;

    // Infinite wrap
    if (container.scrollTop < singleSetHeight * 0.25) {
      container.scrollTop += singleSetHeight;
    } else if (container.scrollTop > singleSetHeight * 1.85) {
      container.scrollTop -= singleSetHeight;
    }

    // Find item closest to vertical center
    let closestIdx = 0;
    let minDistance = Infinity;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(containerCenter - itemCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setCenterItemIndex(closestIdx);
  };

  /* Initial mount / filter change: Scroll to center set */
  useEffect(() => {
    if (scrollContainerRef.current && filteredSongs.length > 1) {
      const singleSetHeight = filteredSongs.length * 75;
      scrollContainerRef.current.scrollTop = singleSetHeight;
      handleQueueScroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSongs.length]);

  // Auto-scroll queue when currentSong changes to bring it into center focus
  useEffect(() => {
    if (!currentSong || repeatedSongs.length === 0) return;
    const targetIdx = repeatedSongs.findIndex((s) => s.id === currentSong.id);
    if (targetIdx >= 0 && itemRefs.current[targetIdx]) {
      itemRefs.current[targetIdx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, repeatedSongs]);

  const handleSongSelect = (song, idx) => {
    if (song.id === currentSong?.id) {
      togglePlay();
    } else {
      playTrack(song, filteredSongs);
    }
    if (itemRefs.current[idx]) {
      itemRefs.current[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full min-h-full lg:h-full flex flex-col justify-between px-4 sm:px-6 md:pl-28 md:pr-10 lg:pr-12 pt-2 sm:pt-3 pb-24 lg:pb-4 overflow-y-visible lg:overflow-hidden">
      {/* ── Background Split Wave (Edge-to-edge behind side panel) ── */}
      <svg
        className="fixed lg:absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Base Teal / Blue left side */}
        <rect width="1440" height="900" fill="#258591" />

        {/* Teal contour wave bands */}
        <path
          d="M 0 0 L 850 0 C 760 220 540 380 480 520 C 400 700 350 780 200 900 L 0 900 Z"
          fill="#207782"
          opacity="0.65"
        />
        <path
          d="M 0 0 L 720 0 C 640 200 480 360 420 500 C 350 670 280 770 120 900 L 0 900 Z"
          fill="#1b6770"
          opacity="0.75"
        />
        <path
          d="M 0 0 L 580 0 C 500 180 390 320 330 460 C 260 620 200 720 50 900 L 0 900 Z"
          fill="#15555d"
          opacity="0.85"
        />

        {/* Orange / Coral contour waves on right side */}
        <path
          d="M 1440 0 L 980 0 C 880 200 750 360 700 500 C 640 670 540 760 380 900 L 1440 900 Z"
          fill="#b82d1b"
        />
        <path
          d="M 1440 0 L 1080 0 C 970 190 820 360 780 500 C 720 670 630 760 460 900 L 1440 900 Z"
          fill="#cf3420"
        />
        <path
          d="M 1440 0 L 1220 0 C 1110 210 940 390 900 520 C 850 670 760 760 620 900 L 1440 900 Z"
          fill="#e8412b"
        />
        <path
          d="M 1440 0 L 1340 0 C 1240 200 1080 400 1040 540 C 990 690 900 780 780 900 L 1440 900 Z"
          fill="#f15642"
          opacity="0.8"
        />
      </svg>

      {/* ── Main Layout Grid: Left Title | Center Vinyl & Controls | Right Infinite Scroll Stream ── */}
      <div className="relative z-10 ml-0 lg:ml-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-4 lg:my-auto">
        {/* ── LEFT COLUMN: Typography & Artist Details ── */}
        <div className="lg:col-span-4 flex flex-col justify-center text-white">
          <span className="text-xs font-bold tracking-widest text-white/70 uppercase">
            TITLE
          </span>

          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
              {currentSong?.title}
            </h1>
            {/* Quick Heart Toggle for Title */}
            <button
              onClick={() => {
                toggleFavorite(currentSong.id);
                showToast(
                  currentSong.isFavorite
                    ? `Removed "${currentSong.title}" from Favourites`
                    : `Added "${currentSong.title}" to Favourites! ❤️`
                );
              }}
              className="p-2 rounded-full hover:bg-white/15 transition-all text-white/80 hover:text-white shrink-0"
              title={currentSong.isFavorite ? "Remove from Favourites" : "Add to Favourites"}
            >
              <HeartIcon filled={currentSong.isFavorite} size={24} />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-white/80 font-medium mt-2 max-w-sm leading-relaxed drop-shadow truncate">
            {currentSong?.featured || currentSong?.album}
          </p>

          <SquiggleWave />

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 drop-shadow truncate">
            {currentSong?.artist}
          </h3>

          <span className="text-xs font-bold tracking-widest text-white/70 uppercase mt-1">
            ARTIST
          </span>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 mt-5">
            <span className="px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
              {currentSong?.genre}
            </span>
            <span className="text-xs text-white/80 font-medium">
              {currentSong?.year} • {currentSong?.duration}
            </span>
          </div>
        </div>

        {/* ── CENTER COLUMN: Rotating Vinyl Record & Audio Controls ── */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center my-3 lg:my-0">
          {/* Realistic Vinyl Disc Container */}
          <div className="relative group flex items-center justify-center">
            {/* Ambient drop shadow behind vinyl */}
            <div className="absolute inset-0 rounded-full bg-black/60 blur-2xl transform scale-95 pointer-events-none" />

            {/* The Vinyl Disc */}
            <div
              className={`w-60 h-60 sm:w-72 sm:h-72 xl:w-80 xl:h-80 rounded-full vinyl-grooves relative flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_2px_rgba(255,255,255,0.08)] cursor-pointer transition-transform duration-300 hover:scale-[1.02] ${
                isPlaying ? "spin-vinyl" : "spin-vinyl spin-paused"
              }`}
              onClick={togglePlay}
              title={isPlaying ? "Click to Pause" : "Click to Play"}
            >
              {/* Vinyl light reflection sheen */}
              <div className="absolute inset-0 rounded-full vinyl-sheen pointer-events-none" />

              {/* Center Record Label / Artwork */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden border-4 border-[#181818] shadow-2xl relative flex items-center justify-center select-none">
                <img
                  src={currentSong?.imageUrl}
                  alt={currentSong?.title}
                  className="w-full h-full object-cover"
                />
                {/* Center sticker text overlay */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] sm:text-xs font-black tracking-wider text-white uppercase truncate max-w-full drop-shadow">
                    {currentSong?.title}
                  </span>
                  <span className="text-[8px] text-white/80 font-bold uppercase tracking-wider">
                    STEREO
                  </span>
                </div>

                {/* Center Spindle Hole */}
                <div className="absolute w-4 h-4 bg-black rounded-full border-2 border-white/50 z-20 shadow-inner" />
              </div>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full max-w-xs sm:max-w-sm mt-6">
            <div
              className="relative w-full h-2 bg-black/30 rounded-full cursor-pointer group py-1"
              onClick={handleSeek}
            >
              <div className="absolute inset-0 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {/* Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-90 group-hover:scale-125 transition-transform"
                style={{ left: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-white/80 mt-1.5 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 mt-3 text-white">
            <button
              onClick={playPrev}
              className="p-2 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-90"
              title="Previous Track"
            >
              <PrevIcon />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 text-white hover:text-white transition-all hover:scale-110 active:scale-95 drop-shadow-lg"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-90"
              title="Next Track"
            >
              <NextIcon />
            </button>
          </div>

          {/* ── HOME PAGE ACTIONS: Add to Favourite & Add to Playlist ── */}
          <div className="flex items-center justify-center gap-2.5 mt-3.5 flex-wrap">
            {/* Add to Favourite */}
            <button
              onClick={() => {
                toggleFavorite(currentSong.id);
                showToast(
                  currentSong.isFavorite
                    ? `Removed "${currentSong.title}" from Favourites`
                    : `Added "${currentSong.title}" to Favourites! ❤️`
                );
              }}
              className={`px-4 py-2 rounded-full border transition-all text-xs font-black tracking-wider uppercase flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg ${
                currentSong.isFavorite
                  ? "bg-[#e8412b] border-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.7)]"
                  : "bg-white/10 hover:bg-white/25 border-white/40 text-white backdrop-blur-md"
              }`}
              title={currentSong.isFavorite ? "Remove from Favourites" : "Add to Favourites"}
            >
              <HeartIcon filled={currentSong.isFavorite} />
              <span>{currentSong.isFavorite ? "Favorited ❤️" : "Add to Favourite"}</span>
            </button>

            {/* Add to Playlist */}
            <button
              onClick={() => setPlaylistModalSong(currentSong)}
              className="px-4 py-2 rounded-full border border-white/40 hover:border-white bg-white/10 hover:bg-white/25 backdrop-blur-md text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
              title="Add to Custom Playlist"
            >
              <PlaylistAddIcon size={16} />
              <span>Add to Playlist</span>
            </button>

            {/* Spotify Quick Save */}
            <button
              onClick={() => showToast("Synced with Spotify 🎧")}
              className="px-3 py-2 rounded-full border border-white/30 hover:border-white/50 bg-black/25 hover:bg-black/40 backdrop-blur-md text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
              title="Spotify"
            >
              <SpotifyIcon />
              <span className="hidden sm:inline text-[11px]">Spotify</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Search Between Categories / Songs & Infinite Queue Stream ── */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-white uppercase drop-shadow">
                UP NEXT QUEUE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <span className="text-[11px] font-black text-white/90 bg-white/15 px-3 py-0.5 rounded-full backdrop-blur-md border border-white/20">
              {filteredSongs.length} Tracks
            </span>
          </div>

          {/* ── Search Between Category Options or Songs Control ── */}
          <div className="mb-2 px-1 space-y-1.5">
            {/* Mode Selector Toggle: Songs vs Categories */}
            <div className="flex items-center justify-between gap-1.5 bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/15 shadow-inner">
              <button
                onClick={() => setSearchMode("songs")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-full text-xs font-black transition-all ${
                  searchMode === "songs"
                    ? "bg-[#e8412b] text-white shadow-[0_0_12px_rgba(232,65,43,0.7)]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🎵</span>
                <span>Songs</span>
              </button>
              <button
                onClick={() => setSearchMode("categories")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-full text-xs font-black transition-all ${
                  searchMode === "categories"
                    ? "bg-[#e8412b] text-white shadow-[0_0_12px_rgba(232,65,43,0.7)]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🏷️</span>
                <span>Categories</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center bg-black/25 backdrop-blur-md border border-white/15 focus-within:border-white/50 rounded-xl px-3 py-1.5 transition-all">
              <SearchIcon />
              <input
                type="text"
                placeholder={
                  searchMode === "songs"
                    ? "Search songs, artists..."
                    : `Filter ${selectedCategory === "All" ? "categories" : selectedCategory}...`
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-white/50 w-full ml-2 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-white/60 hover:text-white text-xs px-1.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Chips Bar (active when in categories mode) */}
            {searchMode === "categories" && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? "bg-white text-black border-white shadow-md font-black"
                        : "bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infinite Vertical Scroll Stream with Top & Bottom Fade Mask */}
          <div className="relative w-full h-[320px] sm:h-[350px] lg:h-[380px] overflow-hidden">
            {repeatedSongs.length > 0 ? (
              <div
                ref={scrollContainerRef}
                onScroll={handleQueueScroll}
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                }}
                className="w-full h-full overflow-y-auto no-scrollbar space-y-2.5 px-3 py-6"
              >
                {repeatedSongs.map((song, idx) => {
                  const isCenter = idx === centerItemIndex;
                  const isCurrentPlaying = song.id === currentSong?.id;

                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      onClick={() => handleSongSelect(song, idx)}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-300 ease-out transform select-none ${
                        /* Center enlargement / zoom */
                        isCenter
                          ? "scale-[1.05] z-20 opacity-100 shadow-[0_15px_35px_rgba(0,0,0,0.45)]"
                          : "scale-[0.94] z-10 opacity-75 hover:opacity-95 hover:scale-[0.98]"
                      } ${
                        /* Highlight currently playing track */
                        isCurrentPlaying
                          ? "bg-white/35 backdrop-blur-xl border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] text-white"
                          : "bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25"
                      }`}
                    >
                      {/* Thumbnail Artwork */}
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/25 shadow-md">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Play/Pause icon overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs">
                            {isCurrentPlaying && isPlaying ? <MiniPauseIcon /> : <MiniPlayIcon />}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs sm:text-sm font-black truncate ${isCurrentPlaying ? "text-white drop-shadow" : "text-white"}`}>
                          {song.title}
                        </div>
                        <div className="text-[11px] text-white/80 truncate mt-0.5 font-medium">
                          {song.artist}
                        </div>
                      </div>

                      {/* Playing Equalizer / Duration / Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrentPlaying && isPlaying && (
                          <div className="flex items-end gap-0.5 h-3.5">
                            <div className="w-0.5 bg-white rounded-full eq-bar-1" />
                            <div className="w-0.5 bg-white rounded-full eq-bar-2" />
                            <div className="w-0.5 bg-white rounded-full eq-bar-3" />
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-white/85">
                          {song.duration}
                        </span>

                        {/* Add to Playlist button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaylistModalSong(song);
                          }}
                          className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all"
                          title="Add to Playlist"
                        >
                          <PlaylistAddIcon size={14} />
                        </button>

                        {/* Add to Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song.id);
                            showToast(
                              song.isFavorite
                                ? `Removed "${song.title}" from Favourites`
                                : `Added "${song.title}" to Favourites! ❤️`
                            );
                          }}
                          className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-all"
                          title={song.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <HeartIcon filled={song.isFavorite} size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/80 space-y-3 bg-black/20 rounded-2xl border border-white/15">
                <span className="text-3xl">🔍</span>
                <p className="text-xs font-bold">No songs match your search or category filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-black transition-all"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar: Volume and Audio Mode ── */}
      <div className="relative z-10 flex items-center justify-between pt-3 mt-4 lg:mt-1 pb-4 lg:pb-0 border-t border-white/15">
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
          <button
            onClick={toggleMute}
            className="text-white/80 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeIcon muted={isMuted} level={volume} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
            className="w-20 sm:w-28 accent-white cursor-pointer h-1.5 bg-white/30 rounded-full"
          />
          <span className="text-xs font-bold text-white/80 hidden sm:inline">
            {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isPlaying ? "Playing in Hi-Fi" : "Hi-Fi Ready"}
          </span>
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

      {/* ── Floating Notification Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-8 z-50 bg-[#e8412b] text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(232,65,43,0.8)] border border-white/30 flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
