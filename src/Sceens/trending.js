import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMusic } from "../Shared/MusicContext";
import Curved3DCarousel from "../Components/Curved3DCarousel";

/* ── SVG Icons ── */
const PlayIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5" />
    <rect x="14" y="4" width="4" height="16" rx="1.5" />
  </svg>
);

const HeartIcon = ({ filled, size = 18 }) => (
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

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const HeadphonesIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MoreOptionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="12" r="2" />
  </svg>
);

const PrevTrackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const NextTrackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

/* ── Fans Like Too Artist Data (from Image 2) ── */
const FANS_LIKE_ARTISTS = [
  {
    id: "art-1",
    name: "The Weeknd",
    listeners: "104.5M",
    genre: "R&B / Synth",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    topSongTitle: "Blinding Lights",
  },
  {
    id: "art-2",
    name: "Eminem",
    listeners: "68.2M",
    genre: "Hip-Hop",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    topSongTitle: "SOS",
  },
  {
    id: "art-3",
    name: "Sam Smith",
    listeners: "42.8M",
    genre: "Soul / Pop",
    imageUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
    topSongTitle: "Summer Days",
  },
  {
    id: "art-4",
    name: "Bruno Mars",
    listeners: "74.1M",
    genre: "Funk / Pop",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    topSongTitle: "Señorita",
  },
  {
    id: "art-5",
    name: "Adele",
    listeners: "52.6M",
    genre: "Soul / Ballad",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    topSongTitle: "Someone Like You",
  },
  {
    id: "art-6",
    name: "Shawn Mendes",
    listeners: "46.3M",
    genre: "Pop / Acoustic",
    imageUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    topSongTitle: "Señorita",
  },
];

export default function Trending() {
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
    toggleFavorite,
    playNext,
    playPrev,
    seek,
    setVolumeLevel,
    toggleMute,
  } = useMusic();

  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);

  /* ── Universal Song Play Handler ── */
  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, songs);
    }
  };

  /* ── John Legend Top Song (All of Me or first John Legend song) ── */
  const johnLegendSongs = useMemo(() => {
    return songs.filter(
      (s) =>
        s.artist?.toLowerCase().includes("legend") ||
        s.title?.toLowerCase().includes("all of me") ||
        s.title?.toLowerCase().includes("know better") ||
        s.title?.toLowerCase().includes("bigger love")
    );
  }, [songs]);

  const featuredHeroSong = johnLegendSongs[0] || songs[0];

  /* ── Top Songs (Right Side of Top Banner) ── */
  const topSongsList = useMemo(() => {
    // Curated top hits matching Image 2
    if (johnLegendSongs.length >= 3) {
      return johnLegendSongs.slice(0, 4);
    }
    return songs.slice(0, 4);
  }, [johnLegendSongs, songs]);

  /* ── Trending Spotlight Songs for 3D Carousel (Image 1 Feature) ── */
  const carouselSongs = useMemo(() => {
    // Rich variety for the 3D curved horizontal scroll
    return songs.slice(0, 10);
  }, [songs]);

  /* ── Playlist Songs for Horizontal Rectangular Cards (Image 2 Feature) ── */
  const playlistSongs = useMemo(() => {
    if (showAllPlaylist) return songs;
    return songs.slice(0, 8);
  }, [songs, showAllPlaylist]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };


  return (
    <div className="relative min-h-full max-w-[1400px] mx-auto text-white space-y-8 pb-36 sm:pb-32 px-1 sm:px-2 md:px-0">
      {/* ── Ambient Dark Glassmorphism Backdrop ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c2227] via-[#08171b] to-[#050e10]" />
        {/* Subtle ambient glowing spots */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#e8412b]/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-[#2d8a95]/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-[#cf3420]/10 rounded-full blur-[160px]" />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 space-y-8">
        {/* ── SECTION 1: TOP ROW (Featured Artist Hero Banner & Top Song Panel) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ── Featured Artist Hero Banner (John Legend Style) ── */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] group">
            {/* Background Artist Portrait with smooth gradient fade */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 pointer-events-none select-none overflow-hidden z-0">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&h=800&fit=crop"
                alt="John Legend"
                className="w-full h-full object-cover object-top filter grayscale contrast-125 opacity-40 sm:opacity-75 transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark gradient vignettes so text on left stays ultra crisp */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            {/* Top Row: Artist Tag & Verified Badge */}
            <div className="relative z-10 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#2d8a95]/30 text-cyan-200 border border-[#2d8a95]/50 px-3 py-1 rounded-full text-xs font-black tracking-wide shadow-md backdrop-blur-md">
                <span>Artist</span>
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px]">
                  <CheckIcon size={10} />
                </span>
              </div>
              <span className="text-xs text-white/60 font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                Trending #1 Globally
              </span>
            </div>

            {/* Center: Big Artist Typography & Listeners Count */}
            <div className="relative z-10 my-4 sm:my-6 max-w-xl">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                John Legend
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-bold mt-1.5 flex items-center gap-2">
                <HeadphonesIcon size={16} />
                <span>54,698,364 Monthly Listeners</span>
              </p>
              <p className="text-xs sm:text-sm text-white/60 mt-2 line-clamp-2 max-w-md hidden sm:block">
                EGOT-winning singer, songwriter, and producer known for chart-topping romantic ballads and timeless soul anthems.
              </p>
            </div>

            {/* Bottom Row: Action Buttons */}
            <div className="relative z-10 flex items-center gap-3 flex-wrap">
              {/* Big Play Button */}
              <button
                onClick={() => handlePlay(featuredHeroSong)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-[#e8412b] to-[#cf3420] hover:from-[#f05742] hover:to-[#e8412b] text-white font-black text-sm px-6 sm:px-8 py-3 rounded-full shadow-[0_0_25px_rgba(232,65,43,0.7)] border border-white/30 transition-all hover:scale-105 active:scale-95"
              >
                {currentSong?.id === featuredHeroSong.id && isPlaying ? (
                  <>
                    <PauseIcon size={20} />
                    <span>Pause Hit</span>
                  </>
                ) : (
                  <>
                    <PlayIcon size={20} />
                    <span>Play Top Hit</span>
                  </>
                )}
              </button>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing((prev) => !prev)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black tracking-wider uppercase border transition-all ${
                  isFollowing
                    ? "bg-white/25 border-white text-white shadow-md"
                    : "bg-white/10 hover:bg-white/20 border-white/20 text-white/90 hover:text-white"
                }`}
              >
                {isFollowing ? (
                  <>
                    <CheckIcon size={14} />
                    <span>Following</span>
                  </>
                ) : (
                  <span>+ Follow</span>
                )}
              </button>

              {/* View Now Playing / Vinyl Link */}
              <Link
                to="/player"
                className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white text-xs font-bold px-4 py-3 rounded-full border border-white/15 backdrop-blur-md transition-all hover:scale-105"
              >
                <span>Vinyl View</span>
                <span>↗</span>
              </Link>
            </div>
          </div>

          {/* ── Top Song Panel (Right Column from Image 2) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Top Song</span>
                <span className="w-2 h-2 rounded-full bg-[#e8412b] animate-pulse" />
              </h2>
              <button
                onClick={() => setShowAllPlaylist((prev) => !prev)}
                className="text-xs font-bold text-white/60 hover:text-white transition-colors"
              >
                See all
              </button>
            </div>

            {/* List of top songs */}
            <div className="space-y-3 flex-1 flex flex-col justify-around">
              {topSongsList.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlay(song)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? "bg-white/15 border-[#e8412b] shadow-[0_0_18px_rgba(232,65,43,0.4)]"
                        : "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Rank & Artwork */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-black text-white/50 w-5 text-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#e8412b] animate-ping" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-orange-200 transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-white/70 font-semibold truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Duration & Play button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-white/60">
                        {song.duration}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(song);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrentPlaying
                            ? "bg-[#e8412b] text-white shadow-[0_0_12px_rgba(232,65,43,0.7)]"
                            : "bg-white/10 hover:bg-[#e8412b] text-white/80 hover:text-white"
                        }`}
                        aria-label={isCurrentPlaying ? "Pause" : "Play"}
                      >
                        {isCurrentPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: 3D CURVED PERSPECTIVE HORIZONTALLY SCROLLABLE CAROUSEL (Image 1 Feature) ── */}
        <div className="rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 sm:p-6">
          <Curved3DCarousel
            songs={carouselSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onFavorite={toggleFavorite}
          />
        </div>

        {/* ── SECTION 3: BOTTOM ROW (Playlist Leaderboard & Fans Like Too Artists) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Playlist Horizontal Rectangular Cards (Left Column from Image 2) ── */}
          <div className="lg:col-span-8 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 sm:p-7">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Playlist</span>
                  <span className="text-xs font-black bg-[#e8412b]/30 text-orange-200 border border-[#e8412b]/50 px-2.5 py-0.5 rounded-full">
                    {playlistSongs.length} Tracks
                  </span>
                </h2>
                <p className="text-xs text-white/70 mt-0.5">
                  Trending worldwide charts • Updated continuously
                </p>
              </div>

              <button
                onClick={() => setShowAllPlaylist((prev) => !prev)}
                className="text-xs font-bold text-white/70 hover:text-white transition-colors"
              >
                {showAllPlaylist ? "Show less" : "See all"}
              </button>
            </div>

            {/* Table Header Row (Hidden on very small screens) */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white/50 border-b border-white/10">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-5">Title & Artist</span>
              <span className="col-span-3 text-right">Streams</span>
              <span className="col-span-1 text-right">Time</span>
              <span className="col-span-2 text-center">Action</span>
            </div>

            {/* Horizontal Rectangular Song Cards List */}
            <div className="space-y-2.5 mt-3">
              {playlistSongs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlay(song)}
                    className={`rounded-2xl border p-2.5 sm:p-3 transition-all duration-200 cursor-pointer group flex items-center justify-between gap-3 sm:gap-4 select-none ${
                      isCurrent
                        ? "bg-white/15 border-[#e8412b] shadow-[0_0_20px_rgba(232,65,43,0.35)]"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Left: Rank, Thumbnail, Title, Artist */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {/* Rank / Playing Equalizer */}
                      <div className="w-6 text-center shrink-0">
                        {isCurrentPlaying ? (
                          <div className="flex items-end justify-center gap-0.5 h-4">
                            <span className="w-1 bg-[#e8412b] h-full animate-bounce" />
                            <span className="w-1 bg-[#e8412b] h-2/3 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 bg-[#e8412b] h-4/5 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        ) : (
                          <span className="text-xs font-black text-white/50 group-hover:text-white transition-colors">
                            #{index + 1}
                          </span>
                        )}
                      </div>

                      {/* Artwork thumbnail */}
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play overlay icon on card */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <PlayIcon size={14} />
                        </div>
                      </div>

                      {/* Song Details */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-white truncate group-hover:text-orange-200 transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-xs text-white/70 font-semibold truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Stream count (Desktop & Tablet) */}
                    <div className="hidden sm:flex items-center justify-end gap-1.5 text-xs text-white/70 font-semibold shrink-0 w-32">
                      <HeadphonesIcon size={12} />
                      <span>{song.streams || "184,320,119"}</span>
                    </div>

                    {/* Duration */}
                    <div className="text-xs text-white/60 font-bold shrink-0 w-12 text-right">
                      {song.duration}
                    </div>

                    {/* Right: Heart & Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        aria-label="Toggle Favorite"
                      >
                        <HeartIcon filled={song.isFavorite} size={16} />
                      </button>

                      {/* Play / Pause Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(song);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrentPlaying
                            ? "bg-[#e8412b] text-white shadow-[0_0_12px_rgba(232,65,43,0.7)]"
                            : "bg-white/10 hover:bg-[#e8412b] text-white"
                        }`}
                        aria-label={isCurrentPlaying ? "Pause" : "Play"}
                      >
                        {isCurrentPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                      </button>

                      {/* More Options */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors hidden sm:block"
                        aria-label="More options"
                      >
                        <MoreOptionsIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Fans Like Too Section (Right Column from Image 2) ── */}
          <div className="lg:col-span-4 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Fans Like too</span>
              </h2>
              <span className="text-xs font-bold text-white/60">6 Artists</span>
            </div>

            {/* 2-column grid of 6 artists (matching Image 2) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {FANS_LIKE_ARTISTS.map((artist) => {
                // Find top song for this artist in catalog
                const matchingSong = songs.find(
                  (s) =>
                    s.artist?.toLowerCase().includes(artist.name.toLowerCase()) ||
                    s.title?.toLowerCase().includes(artist.topSongTitle.toLowerCase())
                ) || songs[0];

                const isArtistPlaying = currentSong?.id === matchingSong?.id && isPlaying;

                return (
                  <div
                    key={artist.id}
                    onClick={() => handlePlay(matchingSong)}
                    className="group relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 p-2.5 sm:p-3 flex flex-col items-center text-center transition-all cursor-pointer shadow-md backdrop-blur-md"
                  >
                    {/* Artist Avatar Photo */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border border-white/15 mb-2.5">
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#e8412b] text-white flex items-center justify-center shadow-lg">
                          {isArtistPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Artist Name & Stats */}
                    <h4 className="text-xs sm:text-sm font-black text-white truncate w-full group-hover:text-orange-200 transition-colors">
                      {artist.name}
                    </h4>
                    <p className="text-[11px] text-white/60 font-semibold truncate w-full mt-0.5">
                      {artist.listeners}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Persistent Bottom Mini Player Bar (Matching Image 2) ── */}
      {currentSong && (
        <div className="fixed bottom-16 sm:bottom-18 md:bottom-2 left-0 right-0 md:left-24 lg:left-28 md:right-6 z-30 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto rounded-2xl bg-[#091b1f]/95 backdrop-blur-2xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(45,138,149,0.3)] p-2.5 sm:p-3 flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Current Track Thumbnail, Title, Artist, Favorite */}
            <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
              <Link to="/player" className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md group">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#e8412b] animate-ping" />
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to="/player" className="text-xs sm:text-sm font-black text-white truncate block hover:text-orange-200 transition-colors">
                  {currentSong.title}
                </Link>
                <p className="text-[11px] text-white/70 font-semibold truncate">
                  {currentSong.artist}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentSong.id)}
                className="p-1 rounded-full text-white/70 hover:text-white transition-colors shrink-0"
                aria-label="Toggle Favorite"
              >
                <HeartIcon filled={currentSong.isFavorite} size={16} />
              </button>
            </div>

            {/* Middle: Controls & Progress Bar */}
            <div className="flex-1 flex flex-col items-center max-w-md">
              {/* Playback Buttons */}
              <div className="flex items-center gap-3 sm:gap-5">
                <button
                  onClick={playPrev}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Previous Track"
                >
                  <PrevTrackIcon />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition-transform"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
                </button>
                <button
                  onClick={playNext}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Next Track"
                >
                  <NextTrackIcon />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-white/60 font-semibold">
                <span className="w-8 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 180}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e8412b]"
                />
                <span className="w-8">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & Now Playing Link */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button
                onClick={toggleMute}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Toggle Mute"
              >
                {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2d8a95]"
              />
              <Link
                to="/player"
                className="text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition-all shadow-sm"
              >
                Vinyl View ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
