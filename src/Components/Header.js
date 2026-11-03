import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMusic } from "../Shared/MusicContext";

/* ── SVG Icons ── */
const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// All searchable application pages with relevant keywords
const APP_PAGES = [
  {
    title: "Now Playing",
    subtitle: "Active record player, audio controls & queue stream",
    path: "/player",
    icon: "💿",
    tag: "Player",
    keywords: ["now playing", "player", "playing", "home", "song", "disc", "vinyl", "record player", "turntable"],
  },
  {
    title: "Discover Feed",
    subtitle: "5 curated infinite horizontal vinyl record categories",
    path: "/feed",
    icon: "📡",
    tag: "Discover",
    keywords: ["discover", "feed", "vinyl", "records", "record player", "browse", "genres", "explore"],
  },
  {
    title: "Trending Tracks",
    subtitle: "Hot global stream charts and top hits leaderboard",
    path: "/trending",
    icon: "🔥",
    tag: "Trending",
    keywords: ["trending", "charts", "top", "hot", "leaderboard", "popular", "global", "hits"],
  },
  {
    title: "Your Favourites",
    subtitle: "All your saved and loved tracks ready to stream",
    path: "/favourites",
    icon: "❤️",
    tag: "Favourites",
    keywords: ["favourites", "favorites", "fav", "liked", "hearts", "loved", "saved"],
  },
  {
    title: "Music Library",
    subtitle: "Custom playlists, genre collections & all songs catalog",
    path: "/library",
    icon: "📚",
    tag: "Library",
    keywords: ["library", "playlists", "playlist", "collection", "my music", "songs", "tracks", "all songs"],
  },
];

export default function Header({ user, onLogin, onSignup, onLogout }) {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    songs,
    currentSong,
    isPlaying,
    playTrack,
    togglePlay,
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useMusic();

  const query = searchQuery.trim().toLowerCase();

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Matching pages
  const matchingPages = useMemo(() => {
    if (!query) return [];
    return APP_PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.tag.toLowerCase().includes(query) ||
        page.keywords.some((kw) => kw.includes(query) || query.includes(kw))
    );
  }, [query]);

  // Matching songs
  const matchingSongs = useMemo(() => {
    if (!query) return [];
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)
    );
  }, [songs, query]);

  // Matching categories
  const matchingCategories = useMemo(() => {
    if (!query) return [];
    return categories.filter(
      (cat) => cat.toLowerCase() !== "all" && cat.toLowerCase().includes(query)
    );
  }, [categories, query]);

  const hasResults =
    matchingPages.length > 0 || matchingSongs.length > 0 || matchingCategories.length > 0;

  // Actions
  const handleNavigatePage = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, matchingSongs.length > 0 ? matchingSongs : songs);
    }
    setIsDropdownOpen(false);
    // Show the song on the Now Playing page immediately
    navigate("/player");
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchMode("categories");
    setIsDropdownOpen(false);
    navigate("/feed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query) return;

    // 1. If page matches directly or is top match
    if (matchingPages.length > 0) {
      const directPage =
        matchingPages.find(
          (p) =>
            p.title.toLowerCase() === query ||
            p.keywords.some((k) => k === query)
        ) || matchingPages[0];
      handleNavigatePage(directPage.path);
      return;
    }

    // 2. If song matches, play it and open player
    if (matchingSongs.length > 0) {
      handlePlaySong(matchingSongs[0]);
      return;
    }

    // 3. If category matches, view in feed
    if (matchingCategories.length > 0) {
      handleSelectCategory(matchingCategories[0]);
      return;
    }

    // Fallback: navigate to library with current query
    setIsDropdownOpen(false);
    navigate("/library");
  };

  return (
    <header className="h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-white/10 bg-[#103d44]/80 backdrop-blur-xl sticky top-0 z-30 shrink-0 select-none relative">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#258591] via-[#2d8a95] to-[#e8412b] opacity-80" />

      {/* Left side: Brand Logo + Search with Live Dropdown */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 mr-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2d8a95] to-[#e8412b] flex items-center justify-center shadow-[0_0_15px_rgba(232,65,43,0.5)] border border-white/20 group-hover:scale-105 transition-transform">
            <LogoIcon />
          </div>
          <span className="font-black text-lg tracking-tight text-white hidden xs:flex items-center gap-1.5">
            <span>Beat</span>
            <span className="text-[#e8412b]">Wave</span>
          </span>
        </Link>

        {/* Global Search Bar with Live Universal Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-sm sm:max-w-md lg:max-w-lg">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-black/30 hover:bg-black/40 transition-all border border-white/15 focus-within:border-[#e8412b] focus-within:ring-2 focus-within:ring-[#e8412b]/30 rounded-full px-3 py-1.5 w-full shadow-inner"
          >
            {/* Quick Filter: Songs vs Category (on wider screens) */}
            <select
              value={searchMode === "categories" ? `cat:${selectedCategory}` : "songs"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "songs") {
                  setSearchMode("songs");
                } else if (val.startsWith("cat:")) {
                  setSearchMode("categories");
                  setSelectedCategory(val.replace("cat:", ""));
                }
              }}
              className="bg-white/15 text-white text-xs font-bold rounded-full px-2 py-0.5 border border-white/20 outline-none cursor-pointer hover:bg-white/25 transition-all hidden md:block"
              title="Filter by Songs or Category"
            >
              <option value="songs" className="bg-[#103d44] text-white">🎵 Songs</option>
              <optgroup label="Categories" className="bg-[#103d44] text-orange-300 font-bold">
                {categories.map((cat) => (
                  <option key={cat} value={`cat:${cat}`} className="bg-[#103d44] text-white">
                    🏷️ {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </optgroup>
            </select>

            <SearchIcon />
            <input
              type="text"
              placeholder="Search songs, artists, pages (feed, trending, library)..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsDropdownOpen(false);
              }}
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-white/60 w-full"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="text-white/60 hover:text-white text-xs px-1.5 py-0.5 rounded-full hover:bg-white/10 shrink-0"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          {/* ── LIVE INTERACTIVE SEARCH RESULTS DROPDOWN ── */}
          {isDropdownOpen && query.length > 0 && (
            <div className="absolute top-full left-0 mt-2.5 w-full min-w-[310px] sm:min-w-[460px] md:min-w-[540px] max-h-[75vh] overflow-y-auto rounded-3xl bg-[#09252a]/95 backdrop-blur-2xl border-2 border-[#258591] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(37,133,145,0.45)] z-50 p-3 sm:p-4 text-white animate-in fade-in zoom-in-95 duration-150">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 px-1">
                <span className="text-xs font-bold text-white/70">
                  Search results for <span className="text-orange-300 font-extrabold">"{searchQuery}"</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/80">
                    {matchingPages.length} pages • {matchingSongs.length} songs
                  </span>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-white/60 hover:text-white text-xs px-1"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {hasResults ? (
                <div className="space-y-4">
                  {/* ── SECTION 1: PAGES & SCREENS (REDIRECTS) ── */}
                  {matchingPages.length > 0 && (
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-orange-400 mb-2 px-1 flex items-center gap-1.5">
                        <span>🧭</span>
                        <span>Pages & Screens (Click to Redirect)</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {matchingPages.map((page) => (
                          <div
                            key={page.path}
                            onClick={() => handleNavigatePage(page.path)}
                            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/10 hover:bg-[#e8412b]/25 border border-white/10 hover:border-[#e8412b]/60 transition-all cursor-pointer group shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                                {page.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-white group-hover:text-orange-300 transition-colors">
                                    {page.title}
                                  </span>
                                  <span className="text-[10px] font-bold bg-[#e8412b]/30 text-orange-200 px-2 py-0.5 rounded-full border border-[#e8412b]/50">
                                    {page.tag}
                                  </span>
                                </div>
                                <p className="text-xs text-white/70 truncate mt-0.5">
                                  {page.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-xs font-bold text-white/70 group-hover:text-white shrink-0 bg-white/10 group-hover:bg-[#e8412b] px-3 py-1.5 rounded-xl transition-all">
                              <span>Go to Page</span>
                              <ArrowRightIcon />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── SECTION 2: MATCHING SONGS (PLAY & SHOW ON PLAYER) ── */}
                  {matchingSongs.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#258591] mb-2 px-1">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <span>🎵</span>
                          <span>Matching Songs (Click to Play & View on Player)</span>
                        </span>
                        <span className="text-[10px] text-white/60">
                          {matchingSongs.length} found
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {matchingSongs.slice(0, 6).map((song) => {
                          const isCurrent = currentSong?.id === song.id;
                          const isCurrentPlaying = isCurrent && isPlaying;

                          return (
                            <div
                              key={song.id}
                              onClick={() => handlePlaySong(song)}
                              className={`flex items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                                isCurrent
                                  ? "bg-[#e8412b]/20 border-[#e8412b] shadow-[0_0_15px_rgba(232,65,43,0.4)]"
                                  : "bg-white/5 hover:bg-white/15 border-white/10 hover:border-[#258591]"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Thumbnail */}
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow">
                                  <img
                                    src={song.imageUrl}
                                    alt={song.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white">
                                      {isCurrentPlaying ? <PauseIcon /> : <PlayIcon />}
                                    </span>
                                  </div>
                                </div>

                                {/* Metadata */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                                      {song.title}
                                    </span>
                                    {isCurrentPlaying && (
                                      <span className="text-[9px] font-black uppercase text-[#e8412b] bg-white/20 px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                                        PLAYING
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-white/70 truncate">
                                    {song.artist} • <span className="text-white/50">{song.genre || song.album}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Play Button & Duration */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full hidden xs:inline">
                                  {song.duration}
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlaySong(song);
                                  }}
                                  className="flex items-center gap-1 bg-[#e8412b] hover:bg-[#d93822] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                                  title="Play and view on player"
                                >
                                  {isCurrentPlaying ? <PauseIcon /> : <PlayIcon />}
                                  <span>{isCurrentPlaying ? "Pause" : "Play"}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {matchingSongs.length > 6 && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/library");
                          }}
                          className="w-full mt-2 py-2 text-center text-xs font-bold text-orange-300 hover:text-orange-200 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                        >
                          View all {matchingSongs.length} matching songs in Library →
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── SECTION 3: MATCHING CATEGORIES / GENRES ── */}
                  {matchingCategories.length > 0 && (
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-orange-300 mb-2 px-1 flex items-center gap-1.5">
                        <span>🏷️</span>
                        <span>Matching Categories (View in Discover)</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {matchingCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleSelectCategory(cat)}
                            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#e8412b] border border-white/20 text-xs font-bold text-white transition-all hover:scale-105"
                          >
                            🏷️ {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state when no matches found */
                <div className="text-center py-6 px-4 space-y-3">
                  <div className="text-3xl">🔍</div>
                  <h4 className="text-sm font-bold text-white">
                    No exact results for "{searchQuery}"
                  </h4>
                  <p className="text-xs text-white/70 max-w-xs mx-auto">
                    Try searching for page names like <span className="text-orange-300 font-bold">"feed"</span>, <span className="text-orange-300 font-bold">"trending"</span>, <span className="text-orange-300 font-bold">"library"</span>, or song titles and artists.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => handleNavigatePage("/player")}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#e8412b] text-xs font-bold text-white transition-all"
                    >
                      💿 Now Playing
                    </button>
                    <button
                      onClick={() => handleNavigatePage("/feed")}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#e8412b] text-xs font-bold text-white transition-all"
                    >
                      📡 Discover Feed
                    </button>
                    <button
                      onClick={() => handleNavigatePage("/trending")}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#e8412b] text-xs font-bold text-white transition-all"
                    >
                      🔥 Trending
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Auth & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-white/15 border border-white/20 rounded-full py-1 px-3">
              <div className="w-7 h-7 rounded-full bg-[#e8412b] border border-white/40 flex items-center justify-center text-white text-xs font-black">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <span className="text-sm font-bold text-white hidden sm:inline max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white hover:bg-black/25 px-3 py-1.5 rounded-full transition-all border border-white/10"
              title="Sign Out"
            >
              <LogoutIcon />
              <span className="hidden sm:inline font-bold">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onLogin}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold text-white hover:bg-white/15 rounded-full transition-all border border-white/15"
            >
              Log In
            </button>
            <button
              onClick={onSignup}
              className="px-4 py-1.5 text-xs sm:text-sm font-black text-white bg-[#e8412b] hover:bg-[#d93822] rounded-full shadow-[0_0_18px_rgba(232,65,43,0.7)] transition-all hover:scale-105 active:scale-95 border border-white/20"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
