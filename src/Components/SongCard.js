import React from "react";
import { useMusic } from "../Shared/MusicContext";

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

const HeartIcon = ({ filled }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "#e8412b" : "none"}
    stroke={filled ? "#e8412b" : "currentColor"}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform active:scale-125"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const PlaylistAddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="16" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

export default function SongCard({
  song,
  onPlay,
  onFavorite,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) {
  const { currentSong, isPlaying, playTrack, togglePlay, toggleFavorite } = useMusic();

  const isCurrent = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handleCardClick = (e) => {
    if (onPlay) {
      onPlay(song);
    } else {
      if (isCurrent) {
        togglePlay();
      } else {
        playTrack(song);
      }
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(song.id);
    } else {
      toggleFavorite(song.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded-2xl p-3.5 transition-all duration-200 cursor-pointer group shadow-md backdrop-blur-md flex items-center justify-between gap-3 text-white select-none ${
        isCurrent
          ? "bg-white/20 border-[#e8412b] shadow-[0_0_22px_rgba(232,65,43,0.5)] ring-1 ring-[#e8412b]"
          : "bg-white/10 hover:bg-white/20 border-white/15 hover:border-[#e8412b]/70 hover:shadow-[0_0_20px_rgba(232,65,43,0.3)]"
      }`}
      title={isCurrentPlaying ? "Click to Pause" : "Click to Play"}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Artwork with play overlay */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md">
          <img
            src={song.imageUrl}
            alt={song.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isCurrentPlaying ? "scale-105" : "group-hover:scale-105"
            }`}
          />

          {/* Play/Pause Button Overlay: Visible on hover OR when currently playing */}
          <div
            className={`absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center transition-opacity ${
              isCurrentPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#e8412b] text-white flex items-center justify-center shadow-[0_0_15px_rgba(232,65,43,0.9)] hover:scale-110 active:scale-95 transition-transform">
              {isCurrentPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-bold truncate transition-colors ${
                isCurrent ? "text-orange-300 font-black drop-shadow" : "text-white group-hover:text-orange-200"
              }`}
            >
              {song.title}
            </h4>
            {isCurrentPlaying && (
              <span className="text-[10px] font-black uppercase tracking-wider text-[#e8412b] bg-white/20 px-2 py-0.5 rounded-full border border-[#e8412b]/60 shrink-0 animate-pulse">
                NOW PLAYING
              </span>
            )}
          </div>
          <p className="text-xs text-white/80 truncate mt-0.5 font-medium">{song.artist}</p>
          <p className="text-[11px] text-white/60 truncate mt-0.5">
            {song.album} {song.year ? `• ${song.year}` : ""}
          </p>
        </div>
      </div>

      {/* Right side: Equalizer / duration / action buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Animated equalizer when playing */}
        {isCurrentPlaying && (
          <div className="flex items-end gap-0.5 h-4 px-1.5 py-1 bg-black/40 rounded-full border border-white/20">
            <div className="w-0.5 bg-[#e8412b] rounded-full eq-bar-1" />
            <div className="w-0.5 bg-orange-400 rounded-full eq-bar-2" />
            <div className="w-0.5 bg-white rounded-full eq-bar-3" />
          </div>
        )}

        <span className="text-xs text-white/90 font-bold bg-black/35 px-2.5 py-0.5 rounded-full border border-white/10 hidden sm:inline">
          {song.duration}
        </span>

        {/* Optional Add to Playlist Button */}
        {onAddToPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(song);
            }}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Add to Playlist"
          >
            <PlaylistAddIcon />
          </button>
        )}

        {/* Optional Remove from Playlist Button */}
        {onRemoveFromPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(song.id);
            }}
            className="p-2 rounded-full hover:bg-red-500/30 text-white/70 hover:text-red-400 transition-all hover:scale-110 active:scale-95"
            title="Remove from this playlist"
          >
            <TrashIcon />
          </button>
        )}

        {/* Favorite Heart */}
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full hover:bg-white/20 text-[#e8412b] transition-all hover:scale-110 active:scale-95"
          title={song.isFavorite ? "Remove favorite" : "Add to favorites"}
        >
          <HeartIcon filled={song.isFavorite} />
        </button>
      </div>
    </div>
  );
}
