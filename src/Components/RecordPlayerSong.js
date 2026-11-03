import React from "react";

/* ── SVG Icons ── */
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1.5" />
    <rect x="14" y="4" width="4" height="16" rx="1.5" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={filled ? "#e8412b" : "none"}
    stroke={filled ? "#e8412b" : "currentColor"}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const PlaylistAddIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

export default function RecordPlayerSong({
  song,
  isCenter = false,
  isPlaying = false,
  onPlay,
  onFavorite,
  onAddToPlaylist,
  onSelect,
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex-shrink-0 cursor-pointer select-none transition-all duration-500 ease-out flex flex-col items-center ${
        /* Center enlarged & zoomed in */
        isCenter
          ? "scale-[1.12] sm:scale-[1.15] z-30 opacity-100"
          : "scale-[0.88] sm:scale-[0.90] z-10 opacity-70 hover:opacity-95 hover:scale-[0.96]"
      }`}
      style={{ width: "230px" }}
    >
     
      {/* ── THE EXACT VINYL RECORD DESIGN AS HOME PAGE ── */}
      <div className="relative group/vinyl flex items-center justify-center my-1">
        {/* Ambient Drop Shadow Behind Vinyl */}
        <div
          className={`absolute inset-0 rounded-full blur-m transform scale-95 pointer-events-none transition-all duration-500 ${
            isCenter
              ? "bg-[#e8412b]/40 shadow-[0_0_35px_rgba(232,65,43,0.6)]"
              : "bg-black/80"
          }`}
        />

        {/* The Circular Vinyl Disc */}
        <div
          className={`w-52 h-52 sm:w-56 sm:h-56 rounded-full vinyl-grooves relative flex items-center justify-center cursor-pointer transition-transform duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
            isCenter
              ? "border-2 border-[#e8412b]/80 shadow-[0_25px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(232,65,43,0.5)]"
              : "border border-white/10"
          } ${isPlaying ? "spin-vinyl" : "spin-vinyl spin-paused"}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          title={isPlaying ? "Click to Pause" : "Click to Play"}
        >
          {/* Vinyl Light Reflection Sheen */}
          <div className="absolute inset-0 rounded-full vinyl-sheen pointer-events-none" />

          {/* ── Center Record Label / Artwork (Made Big as Requested!) ── */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#181818] shadow-2xl relative flex items-center justify-center select-none">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
            {/* Center Sticker Text Overlay */}
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex flex-col items-center justify-center p-1.5 text-center">
              <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-white uppercase truncate max-w-full drop-shadow">
                {song.title}
              </span>
              <span className="text-[7px] text-white/80 font-bold uppercase tracking-wider">
                STEREO
              </span>
            </div>

            {/* Center Spindle Hole */}
            <div className="absolute w-3.5 h-3.5 bg-black rounded-full border-2 border-white/60 z-20 shadow-inner" />
          </div>

          {/* Quick Play/Pause Button on Hover or Focus */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(song);
            }}
            className={`absolute z-30 p-3 rounded-full text-white bg-[#e8412b] hover:bg-[#d93822] shadow-[0_0_20px_rgba(232,65,43,0.9)] border-2 border-white/40 transition-all transform hover:scale-110 active:scale-95 cursor-pointer ${
              isCenter
                ? "opacity-90 hover:opacity-100"
                : "opacity-0 group-hover/vinyl:opacity-100"
            }`}
            title={isPlaying ? "Click to Pause" : "Click to Play"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      {/* ── Song Details (Clearly Visible, Never Hidden on Zoom) ── */}
      <div className="mt-3 flex flex-col items-center text-center space-y-1 w-full px-2">
        {/* Song Title */}
        <h4 className="text-sm font-black text-white truncate w-full drop-shadow group-hover:text-orange-300 transition-colors">
          {song.title}
        </h4>

        {/* Artist Name */}
        <p className="text-xs text-white/75 truncate w-full font-medium">
          {song.artist}
        </p>

        {/* Details & Action Buttons Bar */}
        <div className="flex items-center justify-center gap-2 pt-1.5">
          <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/15">
            {song.duration}
          </span>

          {/* Add to Playlist button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(song);
            }}
            className="p-1.5 rounded-full text-white/80 hover:text-white bg-black/35 hover:bg-[#e8412b] border border-white/20 transition-all shadow-sm hover:scale-105 active:scale-95"
            title="Add to Playlist"
          >
            <PlaylistAddIcon />
          </button>

          {/* Add to Favourite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(song.id);
            }}
            className="p-1.5 rounded-full text-white/80 hover:text-white bg-black/35 hover:bg-[#e8412b] border border-white/20 transition-all shadow-sm hover:scale-105 active:scale-95"
            title={song.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <HeartIcon filled={song.isFavorite} />
          </button>
        </div>
      </div>
    </div>
  );
}
