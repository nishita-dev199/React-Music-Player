import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMusic, EMOJI_OPTIONS } from "../Shared/MusicContext";
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
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

export default function Library() {
  const {
    songs,
    playlists,
    currentSong,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    toggleSongInPlaylist,
    removeSongFromPlaylist,
    searchQuery,
    setSearchQuery,
  } = useMusic();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Current selected playlist view: 'all' | 'fav' | playlistId
  const [activePlaylistId, setActivePlaylistId] = useState("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistIcon, setNewPlaylistIcon] = useState("🎵");
  const [selectedStarterSongs, setSelectedStarterSongs] = useState([]);

  // Add song to playlist modal state
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);

  // Rename modal state
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Notification message
  const [toastMessage, setToastMessage] = useState("");

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const genres = ["All", "Pop", "Dance", "Electronic", "Indie Pop", "Synthwave", "Soul", "Alt Pop"];

  // Current active playlist object (if a custom one is selected)
  const currentCustomPlaylist = useMemo(() => {
    return playlists.find((p) => p.id === activePlaylistId) || null;
  }, [playlists, activePlaylistId]);

  // Filter songs based on active playlist, search, and genre
  const filtered = useMemo(() => {
    let baseList = songs;

    if (activePlaylistId === "fav") {
      baseList = songs.filter((s) => s.isFavorite);
    } else if (currentCustomPlaylist) {
      baseList = songs.filter((s) => currentCustomPlaylist.songIds.includes(s.id));
    }

    const effectiveSearch = (searchTerm || searchQuery || "").trim().toLowerCase();
    return baseList.filter((s) => {
      const matchesSearch =
        !effectiveSearch ||
        s.title.toLowerCase().includes(effectiveSearch) ||
        s.artist.toLowerCase().includes(effectiveSearch) ||
        s.album?.toLowerCase().includes(effectiveSearch) ||
        (s.genre && s.genre.toLowerCase().includes(effectiveSearch));
      const matchesGenre =
        selectedGenre === "All" || (s.genre && s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      return matchesSearch && matchesGenre;
    });
  }, [songs, activePlaylistId, currentCustomPlaylist, searchTerm, searchQuery, selectedGenre]);

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playTrack(song, filtered);
    }
  };

  /* ── Playlist Creation ── */
  const handleOpenCreateModal = () => {
    setNewPlaylistName("");
    setNewPlaylistIcon("🎵");
    setSelectedStarterSongs([]);
    setShowCreateModal(true);
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;

    const newPlaylist = createPlaylist(trimmed, newPlaylistIcon || "🎵", selectedStarterSongs);
    setActivePlaylistId(newPlaylist.id);
    setShowCreateModal(false);
    showNotification(`Created playlist "${trimmed}"! 🎶`);
  };

  /* ── Playlist Renaming ── */
  const handleStartRename = (playlist) => {
    setEditingPlaylist(playlist);
    setRenameValue(playlist.name);
  };

  const handleSaveRename = (e) => {
    e.preventDefault();
    if (!editingPlaylist || !renameValue.trim()) return;

    const updatedName = renameValue.trim();
    renamePlaylist(editingPlaylist.id, updatedName);
    setEditingPlaylist(null);
    showNotification(`Renamed to "${updatedName}"! ✏️`);
  };

  /* ── Delete Playlist ── */
  const handleDeletePlaylist = (playlistId, playlistName) => {
    if (window.confirm(`Are you sure you want to delete "${playlistName}"?`)) {
      deletePlaylist(playlistId);
      if (activePlaylistId === playlistId) {
        setActivePlaylistId("all");
      }
      showNotification(`Deleted playlist "${playlistName}"`);
    }
  };

  /* ── Remove Song from currently viewed playlist ── */
  const handleRemoveSongFromCurrentPlaylist = (songId) => {
    if (!currentCustomPlaylist) return;
    removeSongFromPlaylist(currentCustomPlaylist.id, songId);
    showNotification(`Removed track from "${currentCustomPlaylist.name}"`);
  };

  return (
    <div className="relative min-h-full max-w-7xl mx-auto space-y-6 text-white pb-12">
      {/* ── Multi-Shaded Orange Wave in the LEFT BOTTOM CORNER ── */}
      <svg
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <rect width="1440" height="900" fill="#144d55" />
        <path d="M 0 350 C 350 400 620 650 900 900 L 0 900 Z" fill="#962112" opacity="0.9" />
        <path d="M 0 440 C 300 480 520 700 760 900 L 0 900 Z" fill="#b82d1b" opacity="0.95" />
        <path d="M 0 530 C 250 560 440 740 630 900 L 0 900 Z" fill="#cf3420" />
        <path d="M 0 620 C 200 640 360 790 500 900 L 0 900 Z" fill="#e8412b" />
        <path d="M 0 710 C 150 720 270 830 380 900 L 0 900 Z" fill="#f05742" />
        <path d="M 0 800 C 100 810 190 860 260 900 L 0 900 Z" fill="#f57665" />
      </svg>

      {/* Floating Success Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#e8412b] text-white px-5 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(232,65,43,0.6)] font-bold text-sm border-2 border-white/30 backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative z-10 space-y-6">
        {/* ── Library Header Card with Create Playlist Action ── */}
        <div className="relative overflow-hidden rounded-3xl bg-black/35 backdrop-blur-xl p-6 sm:p-8 border-2 border-[#e8412b]/60 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(232,65,43,0.3)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-orange-300 uppercase bg-[#e8412b]/30 px-3 py-1 rounded-full border border-[#e8412b]/50">
                Personalized Hub
              </span>
              {currentCustomPlaylist && (
                <span className="text-xs font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Playlist View
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                {currentCustomPlaylist ? (
                  <>
                    <span>{currentCustomPlaylist.icon}</span>
                    <span>{currentCustomPlaylist.name}</span>
                  </>
                ) : activePlaylistId === "fav" ? (
                  <>
                    <span>❤️</span>
                    <span>Favorites Collection</span>
                  </>
                ) : (
                  <span>Music Library</span>
                )}
              </h1>

              {/* Rename button if viewing custom playlist */}
              {currentCustomPlaylist && (
                <button
                  onClick={() => handleStartRename(currentCustomPlaylist)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-[#e8412b] text-white/80 hover:text-white transition-all border border-white/20"
                  title="Rename Playlist"
                >
                  <EditIcon />
                </button>
              )}

              {/* Delete button if viewing custom playlist */}
              {currentCustomPlaylist && (
                <button
                  onClick={() => handleDeletePlaylist(currentCustomPlaylist.id, currentCustomPlaylist.name)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white/80 hover:text-white transition-all border border-white/20"
                  title="Delete Playlist"
                >
                  <TrashIcon />
                </button>
              )}
            </div>

            <p className="text-sm text-white/85 mt-1 max-w-lg">
              {currentCustomPlaylist
                ? `Custom playlist with ${currentCustomPlaylist.songIds.length} tracks. Add or remove songs easily.`
                : "Create custom playlists, customize their names, and organize your favorite audio vibes."}
            </p>
          </div>

          {/* Action Area: Create Playlist Button & Tracks Counter */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Play All in this view */}
            {filtered.length > 0 && (
              <button
                onClick={() => {
                  const isCurrentInList = filtered.some((s) => s.id === currentSong?.id);
                  if (isCurrentInList && isPlaying) {
                    togglePlay();
                  } else {
                    const target = filtered.find((s) => s.id === currentSong?.id) || filtered[0];
                    playTrack(target, filtered);
                  }
                }}
                className="flex items-center gap-2 bg-[#e8412b] hover:bg-[#d93822] text-white px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(232,65,43,0.7)] font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer"
                title="Play tracks"
              >
                {filtered.some((s) => s.id === currentSong?.id) && isPlaying ? <PauseIcon /> : <PlayIcon />}
                <span>{filtered.some((s) => s.id === currentSong?.id) && isPlaying ? "Pause" : "Play All"}</span>
              </button>
            )}

            <Link
              to="/player"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-white/20 transition-all hover:scale-105 shadow-md"
              title="Open Now Playing"
            >
              <span>Now Playing ↗</span>
            </Link>

            {/* ── CREATE OWN PLAYLIST BUTTON ── */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-5 py-3 rounded-2xl shadow-md font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer"
            >
              <PlusIcon />
              <span>Create Playlist</span>
            </button>

            {/* Track Counter */}
            <div className="bg-black/30 border-2 border-white/20 px-5 py-2.5 rounded-2xl text-center shadow-md">
              <span className="block text-2xl font-black text-white">{filtered.length}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/75">Tracks</span>
            </div>
          </div>
        </div>

        {/* ── Playlists Filter Bar (Tabs to switch between All, Favorites, & Custom Playlists) ── */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {/* All Songs tab */}
          <button
            onClick={() => setActivePlaylistId("all")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activePlaylistId === "all"
                ? "bg-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.8)] border-2 border-white/40 scale-105"
                : "bg-black/35 text-white/80 hover:text-white hover:bg-black/50 border border-white/15"
            }`}
          >
            <span>📁</span>
            <span>All Songs</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1">
              {songs.length}
            </span>
          </button>

          {/* Favorites tab */}
          <button
            onClick={() => setActivePlaylistId("fav")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activePlaylistId === "fav"
                ? "bg-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.8)] border-2 border-white/40 scale-105"
                : "bg-black/35 text-white/80 hover:text-white hover:bg-black/50 border border-white/15"
            }`}
          >
            <span>❤️</span>
            <span>Favorites</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1">
              {songs.filter((s) => s.isFavorite).length}
            </span>
          </button>

          {/* User Custom Playlists */}
          {playlists.map((pl) => {
            const isActive = activePlaylistId === pl.id;
            return (
              <div key={pl.id} className="relative group/pl flex items-center">
                <button
                  onClick={() => setActivePlaylistId(pl.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.8)] border-2 border-white/40 scale-105"
                      : "bg-black/35 text-white/80 hover:text-white hover:bg-[#e8412b]/30 border border-white/15"
                  }`}
                >
                  <span>{pl.icon}</span>
                  <span className="max-w-[140px] truncate">{pl.name}</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1">
                    {pl.songIds.length}
                  </span>
                </button>
              </div>
            );
          })}

          {/* Quick Create Button in Playlist Tab Bar */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold border border-dashed border-[#e8412b] text-orange-300 hover:text-white hover:bg-[#e8412b]/30 transition-all whitespace-nowrap"
            title="Create New Playlist"
          >
            <PlusIcon />
            <span>New</span>
          </button>
        </div>

        {/* ── Search & Genre Filters Bar ── */}
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex items-center gap-2.5 bg-black/30 hover:bg-black/45 border-2 border-[#e8412b]/50 focus-within:border-[#e8412b] focus-within:ring-2 focus-within:ring-[#e8412b]/30 rounded-2xl px-4 py-2.5 flex-1 max-w-md transition-all shadow-md backdrop-blur-md">
            <SearchIcon />
            <input
              type="text"
              placeholder={
                currentCustomPlaylist
                  ? `Search in "${currentCustomPlaylist.name}"…`
                  : "Search songs, artists, albums…"
              }
              value={searchTerm || searchQuery}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/60"
            />
            {(searchTerm || searchQuery) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchQuery("");
                }}
                className="text-xs text-white/80 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills with Multiple Orange Shades */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  selectedGenre === genre
                    ? "bg-[#e8412b] text-white shadow-[0_0_18px_rgba(232,65,43,0.8)] border border-white/40 scale-105"
                    : "bg-black/30 text-white/80 hover:text-white hover:bg-[#e8412b]/40 border border-white/15"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid of Songs with Add to Playlist Action ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((song) => (
            <div
              key={song.id}
              className="rounded-2xl border border-[#e8412b]/30 hover:border-[#e8412b] transition-colors shadow-sm"
            >
              <SongCard
                song={song}
                onPlay={handlePlay}
                onFavorite={() => toggleFavorite(song.id)}
                onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                onRemoveFromPlaylist={
                  currentCustomPlaylist ? () => handleRemoveSongFromCurrentPlaylist(song.id) : null
                }
              />
            </div>
          ))}
        </div>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="bg-black/35 border-2 border-[#e8412b]/50 rounded-3xl p-12 text-center text-white/85 space-y-4 backdrop-blur-md shadow-2xl">
            <div className="text-5xl text-[#e8412b]">
              {currentCustomPlaylist ? "🎶" : "🔍"}
            </div>
            <h3 className="text-xl font-black text-white">
              {currentCustomPlaylist
                ? `No songs in "${currentCustomPlaylist.name}" yet`
                : "No tracks found"}
            </h3>
            <p className="text-sm text-white/70 max-w-sm mx-auto">
              {currentCustomPlaylist
                ? "Switch back to 'All Songs' and tap the playlist icon on any song to add it here!"
                : `We couldn't find anything matching "${searchTerm}". Try a different keyword or filter.`}
            </p>
            {currentCustomPlaylist ? (
              <button
                onClick={() => setActivePlaylistId("all")}
                className="px-6 py-2.5 rounded-full bg-[#e8412b] text-white text-xs font-black shadow-lg hover:scale-105 transition-all"
              >
                Browse All Songs
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGenre("All");
                }}
                className="text-xs font-black text-[#e8412b] underline uppercase tracking-wider"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL 1: CREATE OWN PLAYLIST (CUSTOMIZABLE NAME & EMOJI) ── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all"
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div className="relative bg-[#103d44] border-2 border-[#e8412b] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl backdrop-blur-2xl text-white">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#e8412b] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(232,65,43,0.7)] border border-white/30">
                {newPlaylistIcon}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Create New Playlist</h3>
                <p className="text-xs text-white/80">Customize your playlist name & vibe</p>
              </div>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              {/* Customizable Name Field */}
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5 uppercase tracking-wider">
                  Playlist Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Summer Road Trip, Late Night Chill…"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-black/35 border-2 border-white/20 focus:border-[#e8412b] focus:ring-2 focus:ring-[#e8412b]/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 outline-none transition-all font-bold"
                  maxLength={40}
                  required
                />
              </div>

              {/* Emoji / Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5 uppercase tracking-wider">
                  Choose Playlist Icon
                </label>
                <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-black/25 rounded-2xl border border-white/15">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewPlaylistIcon(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                        newPlaylistIcon === emoji
                          ? "bg-[#e8412b] scale-110 shadow-[0_0_10px_rgba(232,65,43,0.8)] border border-white/40"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Starter Songs Picker */}
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5 uppercase tracking-wider">
                  Add Starter Tracks ({selectedStarterSongs.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 bg-black/25 rounded-2xl p-2 border border-white/15 scrollbar-thin">
                  {songs.map((song) => {
                    const isChecked = selectedStarterSongs.includes(song.id);
                    return (
                      <label
                        key={song.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                          isChecked ? "bg-white/20 font-bold" : "hover:bg-white/10 text-white/80"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedStarterSongs((prev) =>
                              isChecked ? prev.filter((id) => id !== song.id) : [...prev, song.id]
                            );
                          }}
                          className="accent-[#e8412b] w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="truncate flex-1">{song.title} — {song.artist}</span>
                        <span className="text-[10px] text-white/60">{song.duration}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-white/80 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#e8412b] hover:bg-[#d93822] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(232,65,43,0.7)] disabled:opacity-50 transition-all hover:scale-105 active:scale-95 border border-white/25"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD SONG TO PLAYLIST PICKER ── */}
      {songToAddToPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all"
          onClick={(e) => e.target === e.currentTarget && setSongToAddToPlaylist(null)}
        >
          <div className="relative bg-[#103d44] border-2 border-[#e8412b] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl backdrop-blur-2xl text-white">
            <button
              onClick={() => setSongToAddToPlaylist(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
            >
              ✕
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                Add to Custom Playlist
              </span>
              <h3 className="text-lg font-black text-white mt-1 truncate">
                "{songToAddToPlaylist.title}"
              </h3>
              <p className="text-xs text-white/75">{songToAddToPlaylist.artist}</p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin my-3">
              {playlists.map((pl) => {
                const isAlreadyIn = pl.songIds.includes(songToAddToPlaylist.id);
                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      toggleSongInPlaylist(pl.id, songToAddToPlaylist.id);
                      showNotification(
                        isAlreadyIn
                          ? `Removed from "${pl.name}"`
                          : `Added to "${pl.name}"! 🎵`
                      );
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                      isAlreadyIn
                        ? "bg-[#e8412b]/30 border-[#e8412b] text-white"
                        : "bg-black/25 hover:bg-white/15 border-white/15 text-white/90"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{pl.icon}</span>
                      <div>
                        <div className="text-sm font-bold">{pl.name}</div>
                        <div className="text-[11px] text-white/70">{pl.songIds.length} tracks</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                        isAlreadyIn
                          ? "bg-[#e8412b] text-white border-white/30"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      }`}
                    >
                      {isAlreadyIn ? "✓ Added" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/15">
              <button
                onClick={() => {
                  setSongToAddToPlaylist(null);
                  handleOpenCreateModal();
                }}
                className="text-xs font-bold text-orange-300 hover:text-white flex items-center gap-1"
              >
                <PlusIcon /> New Playlist
              </button>

              <button
                onClick={() => setSongToAddToPlaylist(null)}
                className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: RENAME PLAYLIST ── */}
      {editingPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all"
          onClick={(e) => e.target === e.currentTarget && setEditingPlaylist(null)}
        >
          <div className="relative bg-[#103d44] border-2 border-[#e8412b] rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl backdrop-blur-2xl text-white">
            <h3 className="text-lg font-black text-white mb-3">Rename Playlist</h3>
            <form onSubmit={handleSaveRename} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-black/35 border-2 border-white/20 focus:border-[#e8412b] rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none"
                maxLength={40}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="px-4 py-2 text-xs font-bold text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="px-5 py-2 rounded-xl bg-[#e8412b] hover:bg-[#d93822] text-white font-black text-xs shadow-md border border-white/20"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
