import React, { useState } from "react";
import { useMusic, EMOJI_OPTIONS } from "../Shared/MusicContext";

export default function AddToPlaylistModal({ song, onClose, onToast }) {
  const { playlists, toggleSongInPlaylist, createPlaylist } = useMusic();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistIcon, setNewPlaylistIcon] = useState("🎵");

  if (!song) return null;

  const handleToggle = (pl) => {
    const isAlreadyIn = pl.songIds.includes(song.id);
    toggleSongInPlaylist(pl.id, song.id);
    if (onToast) {
      onToast(
        isAlreadyIn
          ? `Removed "${song.title}" from "${pl.name}"`
          : `Added "${song.title}" to "${pl.name}"! 🎵`
      );
    }
  };

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPl = createPlaylist(newPlaylistName.trim(), newPlaylistIcon, [song.id]);
    setNewPlaylistName("");
    setShowCreateForm(false);
    if (onToast) {
      onToast(`Created "${newPl.name}" & added "${song.title}"! 🌟`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#103d44] border-2 border-[#e8412b] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl backdrop-blur-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <span className="text-xs font-black text-orange-300 uppercase tracking-widest bg-[#e8412b]/25 px-2.5 py-1 rounded-full border border-[#e8412b]/40">
            Add to Playlist
          </span>
          <h3 className="text-xl font-black text-white mt-2 truncate flex items-center gap-2">
            <span>"{song.title}"</span>
          </h3>
          <p className="text-xs text-white/75 mt-0.5">{song.artist}</p>
        </div>

        {/* Playlists List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar my-4">
          {playlists.map((pl) => {
            const isAlreadyIn = pl.songIds.includes(song.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggle(pl)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                  isAlreadyIn
                    ? "bg-[#e8412b]/30 border-[#e8412b] text-white shadow-[0_0_12px_rgba(232,65,43,0.4)]"
                    : "bg-black/25 hover:bg-white/15 border-white/15 text-white/90"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{pl.icon}</span>
                  <div className="truncate">
                    <div className="text-sm font-bold truncate">{pl.name}</div>
                    <div className="text-[11px] text-white/70">{pl.songIds.length} tracks</div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all shrink-0 ${
                    isAlreadyIn
                      ? "bg-[#e8412b] text-white border-white/30 shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  {isAlreadyIn ? "✓ Added" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick New Playlist Toggle / Form */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mt-2 py-2.5 px-4 rounded-2xl border-2 border-dashed border-[#e8412b]/60 hover:border-[#e8412b] hover:bg-[#e8412b]/15 text-[#f58172] hover:text-white text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <span>+</span>
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="mt-3 p-3 bg-black/35 rounded-2xl border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/90 uppercase tracking-wider">New Playlist</span>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-[11px] text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="text-xl bg-black/40 px-2 py-1.5 rounded-xl border border-white/20 inline-block">
                  {newPlaylistIcon}
                </span>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 bg-black/40 border border-white/20 focus:border-[#e8412b] rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/50 outline-none font-bold"
                maxLength={40}
                required
              />
            </div>

            {/* Emoji quick chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {EMOJI_OPTIONS.slice(0, 8).map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setNewPlaylistIcon(em)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-transform ${
                    newPlaylistIcon === em ? "bg-[#e8412b] scale-110" : "hover:bg-white/15"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="w-full py-2 rounded-xl bg-[#e8412b] hover:bg-[#d93822] text-white font-black text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-md"
            >
              Create & Add Song
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

