import React from "react";
import { Link } from "react-router-dom";
import { useMusic } from "../Shared/MusicContext";
import SongCard from "../Components/SongCard";

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5"/>
    <rect x="14" y="4" width="4" height="16" rx="1.5"/>
  </svg>
);

export default function Trending() {
  const { songs, currentSong, isPlaying, playTrack, togglePlay, toggleFavorite } = useMusic();

  const topSong = songs[0];

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, songs);
    }
  };

  return (
    <div className="relative min-h-full max-w-7xl mx-auto space-y-8 text-white pb-10">
      {/* ── Multi-Shaded Orange Wave in the RIGHT TOP CORNER ── */}
      <svg
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Base Teal */}
        <rect width="1440" height="900" fill="#144d55" />

        {/* Multi-layered organic orange wave bands in RIGHT TOP CORNER */}
        <path d="M 600 0 C 750 300 1100 480 1440 600 L 1440 0 Z" fill="#962112" opacity="0.9" />
        <path d="M 720 0 C 850 260 1180 430 1440 520 L 1440 0 Z" fill="#b82d1b" opacity="0.95" />
        <path d="M 840 0 C 950 230 1240 370 1440 440 L 1440 0 Z" fill="#cf3420" />
        <path d="M 960 0 C 1050 190 1300 310 1440 360 L 1440 0 Z" fill="#e8412b" />
        <path d="M 1080 0 C 1150 150 1350 240 1440 280 L 1440 0 Z" fill="#f05742" />
        <path d="M 1200 0 C 1260 110 1390 180 1440 200 L 1440 0 Z" fill="#f57665" />
      </svg>

      {/* Content wrapper */}
      <div className="relative z-10 space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Trending Tracks</span>
              <span className="text-sm font-black bg-[#e8412b] text-white px-3 py-1 rounded-full shadow-[0_0_15px_rgba(232,65,43,0.7)] border border-white/20">
                🔥 HOT CHARTS
              </span>
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Top charted tracks trending worldwide this week
            </p>
          </div>
          <div className="text-xs text-white font-extrabold bg-[#e8412b] border border-white/20 px-4 py-2 rounded-full self-start sm:self-auto shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Updated Daily</span>
          </div>
        </div>

        {/* Featured Banner: #1 Hit with Orange Border */}
        {topSong && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#e8412b] bg-black/35 backdrop-blur-xl shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              {/* Top Hit Artwork */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shrink-0 shadow-2xl border-4 border-[#e8412b]/80">
                <img
                  src={topSong.imageUrl}
                  alt={topSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#e8412b] text-white px-2.5 py-1 rounded-full text-[11px] font-black border border-white/30 shadow-md flex items-center gap-1">
                  <span>🏆</span> #1 GLOBAL
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-orange-200 bg-[#e8412b]/30 px-3 py-1 rounded-full border border-[#e8412b]/50">
                  Top Hit This Week
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white mt-2 tracking-tight truncate drop-shadow">
                  {topSong.title}
                </h2>
                <p className="text-base text-white/90 font-bold mt-1">
                  {topSong.artist} • <span className="text-orange-200">{topSong.album}</span>
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-5 flex-wrap">
                  <button
                    onClick={() => handlePlay(topSong)}
                    className="flex items-center gap-2 bg-[#e8412b] hover:bg-[#d93822] text-white font-black text-sm px-7 py-3 rounded-full shadow-[0_0_20px_rgba(232,65,43,0.8)] border border-white/30 transition-all hover:scale-105 active:scale-95"
                    title={currentSong?.id === topSong.id && isPlaying ? "Pause" : "Play"}
                  >
                    {currentSong?.id === topSong.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                    <span>{currentSong?.id === topSong.id && isPlaying ? "Pause Track" : "Play Now"}</span>
                  </button>

                  <Link
                    to="/player"
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-full border border-white/25 transition-all hover:scale-105 shadow-md"
                    title="View in Player Page"
                  >
                    <span>Open in Player</span>
                    <span>↗</span>
                  </Link>

                  <span className="text-xs text-white font-bold bg-black/40 px-3.5 py-2 rounded-full border border-white/10">
                    {topSong.duration} mins
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Songs List with Orange Card Borders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Trending Leaderboard</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#e8412b]" />
            </h3>
            <span className="text-xs font-bold text-orange-300">Live Global Streams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((song, index) => {
              const orangeRankColors = [
                "bg-[#f05742] shadow-[0_0_15px_rgba(240,87,66,0.6)]",
                "bg-[#e8412b] shadow-[0_0_15px_rgba(232,65,43,0.6)]",
                "bg-[#cf3420] shadow-[0_0_15px_rgba(207,52,32,0.6)]",
                "bg-[#b82d1b] shadow-[0_0_15px_rgba(184,45,27,0.6)]",
                "bg-[#962112] shadow-[0_0_15px_rgba(150,33,18,0.6)]",
              ];
              const rankColor = orangeRankColors[index] || "bg-[#b82d1b]";

              return (
                <div
                  key={song.id}
                  className="flex items-center gap-3 bg-black/30 hover:bg-black/45 border-2 border-[#e8412b]/40 hover:border-[#e8412b] rounded-2xl p-3 transition-all shadow-md group backdrop-blur-md"
                >
                  {/* Distinct Orange Variations Rank Badge */}
                  <div className={`w-9 h-9 rounded-xl ${rankColor} flex items-center justify-center border border-white/30 shrink-0`}>
                    <span className="text-sm font-black text-white">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <SongCard
                      song={song}
                      onPlay={handlePlay}
                      onFavorite={() => toggleFavorite(song.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
