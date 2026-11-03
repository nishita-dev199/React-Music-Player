import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { sampleSongs } from "./musicData";
import { discoverCategories } from "./discoverData";

const MusicContext = createContext(null);

const DEFAULT_PLAYLISTS = [
  { id: "pl-summer", name: "Summer Vibes", icon: "🏖️", songIds: [1, 2, 4] },
  { id: "pl-energy", name: "Workout Energy", icon: "⚡", songIds: [3, 5, 6] },
];

export const CATEGORIES = [
  "All",
  "Pop",
  "Dance",
  "Electronic",
  "Synthwave",
  "Indie Pop",
  "Soul",
  "Alt Pop",
  "Hollywood Romantics",
  "Blues",
  "Indian Folk",
  "K-POP",
];

export const EMOJI_OPTIONS = ["🏖️", "⚡", "🔥", "🎵", "🌙", "🎸", "🎧", "🚗", "💃", "🌟", "🌴", "💿"];

// Convert "2:43" format to seconds (e.g. 163s)
export const parseDuration = (durStr) => {
  if (typeof durStr === "number" && !isNaN(durStr) && durStr > 0) return durStr;
  if (!durStr || typeof durStr !== "string") return 180;
  const parts = durStr.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
};

// Combine all songs from sampleSongs and discoverCategories into a unified catalog
const allDiscoverSongs = discoverCategories.flatMap((cat) => cat.songs);
const combinedBaseCatalog = [...sampleSongs];
allDiscoverSongs.forEach((song) => {
  if (!combinedBaseCatalog.some((s) => s.id === song.id)) {
    combinedBaseCatalog.push(song);
  }
});

export function MusicProvider({ children }) {
  // Global Audio ref
  const audioRef = useRef(null);

  // Favorites persistence
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem("beatwave_user_favorites");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return sampleSongs.filter((s) => s.isFavorite).map((s) => s.id);
  });

  // Playlists persistence
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("beatwave_user_playlists");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PLAYLISTS;
  });

  // Global Player State: Shared across Discover, Now Playing, and entire app
  const [currentSong, setCurrentSong] = useState(combinedBaseCatalog[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => parseDuration(combinedBaseCatalog[0]?.duration));
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQueue, setCurrentQueue] = useState(combinedBaseCatalog);

  // Search and Category filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("songs"); // 'songs' | 'categories'
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Synchronize favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("beatwave_user_favorites", JSON.stringify(favoriteIds));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favoriteIds]);

  // Synchronize playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("beatwave_user_playlists", JSON.stringify(playlists));
    } catch (e) {
      console.error("Failed to save playlists to localStorage", e);
    }
  }, [playlists]);

  // Keep volume in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keep audio.src and duration in sync when currentSong changes
  useEffect(() => {
    if (!currentSong) return;
    setDuration(parseDuration(currentSong.duration));
    const audio = audioRef.current;
    if (audio) {
      const targetSrc = currentSong.audioUrl || "/audio/track-1.wav";
      if (!audio.src || (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc)) {
        audio.src = targetSrc;
        audio.load();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, currentSong?.audioUrl, currentSong?.duration]);

  // Computed songs list with dynamic isFavorite flag
  const songs = useMemo(() => {
    return combinedBaseCatalog.map((s) => ({
      ...s,
      isFavorite: favoriteIds.includes(s.id),
    }));
  }, [favoriteIds]);

  // Active playing song with dynamic isFavorite flag
  const activeSong = useMemo(() => {
    if (!currentSong) return songs[0];
    return {
      ...currentSong,
      isFavorite: favoriteIds.includes(currentSong.id),
    };
  }, [currentSong, favoriteIds, songs]);

  // Toggle favorite
  const toggleFavorite = useCallback((songId) => {
    setFavoriteIds((prev) => {
      if (prev.includes(songId)) {
        return prev.filter((id) => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  }, []);

  // Play a specific track (from Discover, Now Playing, Library, etc.)
  const playTrack = useCallback((song, queue = null) => {
    if (!song) return;
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(parseDuration(song.duration));
    if (queue && Array.isArray(queue) && queue.length > 0) {
      setCurrentQueue(queue);
    }
    const audio = audioRef.current;
    if (audio) {
      const targetSrc = song.audioUrl || "/audio/track-1.wav";
      if (!audio.src || (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc)) {
        audio.src = targetSrc;
      }
      audio.currentTime = 0;
      audio.loop = true;
      audio.load();
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Audio play prevented / waiting for interaction:", err);
          setIsPlaying(true);
        });
      }
    }
  }, []);

  // Play next track
  const playNext = useCallback(() => {
    const list = currentQueue.length > 0 ? currentQueue : songs;
    const currId = currentSong?.id;
    const idx = list.findIndex((s) => s.id === currId);
    const nextIdx = (idx + 1) % list.length;
    playTrack(list[nextIdx], list);
  }, [currentQueue, songs, currentSong, playTrack]);

  // Play previous track
  const playPrev = useCallback(() => {
    if (currentTime > 3) {
      setCurrentTime(0);
      const audio = audioRef.current;
      if (audio) audio.currentTime = 0;
      return;
    }
    const list = currentQueue.length > 0 ? currentQueue : songs;
    const currId = currentSong?.id;
    const idx = list.findIndex((s) => s.id === currId);
    const prevIdx = idx - 1 < 0 ? list.length - 1 : idx - 1;
    playTrack(list[prevIdx], list);
  }, [currentTime, currentQueue, songs, currentSong, playTrack]);

  // Increment currentTime during playback and auto-advance when reaching duration
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const totalDur = parseDuration(currentSong?.duration);
        if (prev + 1 >= totalDur) {
          playNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentSong?.duration, playNext]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      if (audio) {
        audio.pause();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audio) {
        const targetSrc = currentSong?.audioUrl || "/audio/track-1.wav";
        if (!audio.src || (!audio.src.endsWith(targetSrc) && audio.src !== targetSrc)) {
          audio.src = targetSrc;
          audio.load();
        }
        audio.loop = true;
        if (audio.ended) {
          audio.currentTime = 0;
        }
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn("Audio play resume handled:", err);
            setIsPlaying(true);
          });
        }
      }
    }
  }, [isPlaying, currentSong]);

  // Seek audio
  const seek = useCallback(
    (time) => {
      const totalDur = parseDuration(currentSong?.duration);
      const clampedTime = Math.max(0, Math.min(totalDur, time));
      setCurrentTime(clampedTime);
      const audio = audioRef.current;
      if (audio && audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = clampedTime % audio.duration;
      }
    },
    [currentSong?.duration]
  );

  // Set volume level
  const setVolumeLevel = useCallback((vol) => {
    setVolume(vol);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  // Playlist methods
  const toggleSongInPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const exists = pl.songIds.includes(songId);
        return {
          ...pl,
          songIds: exists
            ? pl.songIds.filter((id) => id !== songId)
            : [...pl.songIds, songId],
        };
      })
    );
  }, []);

  const addSongToPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.songIds.includes(songId)) return pl;
        return { ...pl, songIds: [...pl.songIds, songId] };
      })
    );
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, songIds: pl.songIds.filter((id) => id !== songId) };
      })
    );
  }, []);

  const createPlaylist = useCallback((name, icon = "🎵", starterSongIds = []) => {
    const newId = `pl-${Date.now()}`;
    const newPl = {
      id: newId,
      name: name.trim(),
      icon: icon || "🎵",
      songIds: Array.isArray(starterSongIds) ? starterSongIds : [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    return newPl;
  }, []);

  const renamePlaylist = useCallback((playlistId, newName) => {
    if (!newName.trim()) return;
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === playlistId ? { ...pl, name: newName.trim() } : pl))
    );
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
  }, []);

  const value = useMemo(
    () => ({
      songs,
      playlists,
      favoriteIds,
      currentSong: activeSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      currentQueue,
      playTrack,
      togglePlay,
      seek,
      setVolumeLevel,
      toggleMute,
      playNext,
      playPrev,
      searchQuery,
      setSearchQuery,
      searchMode,
      setSearchMode,
      selectedCategory,
      setSelectedCategory,
      categories: CATEGORIES,
      toggleFavorite,
      toggleSongInPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
    }),
    [
      songs,
      playlists,
      favoriteIds,
      activeSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      currentQueue,
      playTrack,
      togglePlay,
      seek,
      setVolumeLevel,
      toggleMute,
      playNext,
      playPrev,
      searchQuery,
      searchMode,
      selectedCategory,
      toggleFavorite,
      toggleSongInPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
    ]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Global persistent audio element across all pages */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
