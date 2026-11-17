/**
 * Spotify Web API & PKCE Authentication Integration
 * Works seamlessly in both Create React App (Webpack) and Vite.
 */

export const getSpotifyClientId = () => {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.REACT_APP_SPOTIFY_CLIENT_ID) return process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    if (process.env.VITE_SPOTIFY_CLIENT_ID) return process.env.VITE_SPOTIFY_CLIENT_ID;
  }
  return "5eb38f8246ab407b9d3e28a0768e6d3f";
};

export const getSpotifyClientSecret = () => {
  if (typeof process !== "undefined" && process.env) {
    if (process.env.REACT_APP_SPOTIFY_CLIENT_SECRET) return process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
    if (process.env.SPOTIFY_CLIENT_SECRET) return process.env.SPOTIFY_CLIENT_SECRET;
    if (process.env.VITE_SPOTIFY_CLIENT_SECRET) return process.env.VITE_SPOTIFY_CLIENT_SECRET;
  }
  return null;
};

export const getSpotifyRedirectUri = () => {
  if (typeof window !== "undefined") {
    // If running on localhost or 127.0.0.1, use the local callback URL registered in Spotify Dashboard
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return `${window.location.origin}/callback`;
    }
  }

  if (typeof process !== "undefined" && process.env) {
    if (process.env.REACT_APP_SPOTIFY_REDIRECT_URI) return process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
    if (process.env.VITE_SPOTIFY_REDIRECT_URI) return process.env.VITE_SPOTIFY_REDIRECT_URI;
  }

  return "https://react-music-player-sigma-three.vercel.app/callback";
};

const randomString = (length = 64) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

async function createChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

/**
 * Initiates the PKCE OAuth Login flow with Spotify Accounts
 */
export async function connectSpotify() {
  const verifier = randomString(64);
  const state = randomString(32);
  const challenge = await createChallenge(verifier);

  const clientId = getSpotifyClientId();
  const redirectUri = getSpotifyRedirectUri();

  // Store verifier & state in both sessionStorage and localStorage for resilience across redirects
  try {
    sessionStorage.setItem("spotify_verifier", verifier);
    sessionStorage.setItem("spotify_state", state);
    localStorage.setItem("spotify_verifier", verifier);
    localStorage.setItem("spotify_state", state);
  } catch (e) {
    console.warn("Storage warning:", e);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: SPOTIFY_SCOPES,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Handles the redirect callback from Spotify, exchanging code for access token
 */
export async function handleSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (params.get("error")) {
    throw new Error(params.get("error_description") || "Spotify authorization was cancelled or denied.");
  }

  if (!code) return false;

  const savedState =
    sessionStorage.getItem("spotify_state") || localStorage.getItem("spotify_state");
  const verifier =
    sessionStorage.getItem("spotify_verifier") || localStorage.getItem("spotify_verifier");

  if (!savedState || state !== savedState || !verifier) {
    // If state mismatch or missing verifier, try checking if token is already stored
    if (isSpotifyConnected()) return true;
    throw new Error("Spotify login validation failed. Please try connecting again.");
  }

  const clientId = getSpotifyClientId();
  const redirectUri = getSpotifyRedirectUri();

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Could not exchange code with Spotify.");
  }

  const expiresAt = String(Date.now() + data.expires_in * 1000);

  // Store tokens in both session & local storage
  try {
    sessionStorage.setItem("spotify_access_token", data.access_token);
    sessionStorage.setItem("spotify_expires_at", expiresAt);
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_expires_at", expiresAt);
    if (data.refresh_token) {
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
    }
    sessionStorage.removeItem("spotify_verifier");
    sessionStorage.removeItem("spotify_state");
    localStorage.removeItem("spotify_verifier");
    localStorage.removeItem("spotify_state");
  } catch (e) {
    console.error("Storage error:", e);
  }

  return true;
}

/**
 * Check if the user has an active, valid Spotify token (user token or client credentials token)
 */
export function isSpotifyConnected() {
  return Boolean(getSpotifyToken());
}

/**
 * Returns the active Spotify access token (user OAuth or client credentials), if valid
 */
export function getSpotifyToken() {
  try {
    const userToken =
      sessionStorage.getItem("spotify_access_token") ||
      localStorage.getItem("spotify_access_token");
    const userExpiresAt = Number(
      sessionStorage.getItem("spotify_expires_at") ||
      localStorage.getItem("spotify_expires_at") ||
      0
    );
    if (userToken && Date.now() < userExpiresAt) {
      return userToken;
    }

    const appToken = localStorage.getItem("spotify_app_token");
    const appExpiresAt = Number(localStorage.getItem("spotify_app_token_expires_at") || 0);
    if (appToken && Date.now() < appExpiresAt) {
      return appToken;
    }
  } catch (e) {}
  return null;
}

/**
 * Fetches token via Spotify Client Credentials flow if CLIENT_SECRET is present
 */
export async function fetchClientCredentialsToken() {
  const clientId = getSpotifyClientId();
  const clientSecret = getSpotifyClientSecret();
  if (!clientId || !clientSecret) return null;

  try {
    const creds = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${creds}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });
    const data = await res.json();
    if (data.access_token) {
      const expiresAt = String(Date.now() + data.expires_in * 1000);
      localStorage.setItem("spotify_app_token", data.access_token);
      localStorage.setItem("spotify_app_token_expires_at", expiresAt);
      return data.access_token;
    }
  } catch (err) {
    console.warn("Client credentials error:", err);
  }
  return null;
}

/**
 * Disconnect Spotify
 */
export function disconnectSpotify() {
  try {
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_expires_at");
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_expires_at");
    localStorage.removeItem("spotify_refresh_token");
  } catch (e) {
    console.error(e);
  }
}

/**
 * Authenticated request to Spotify Web API
 */
export async function spotifyRequest(endpoint) {
  const token = getSpotifyToken();

  if (!token) {
    throw new Error("Your Spotify session is not connected or has expired. Please connect Spotify.");
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      disconnectSpotify();
    }
    throw new Error(data.error?.message || "Spotify request failed.");
  }

  return data;
}

/**
 * Converts Spotify track object to our application's song schema
 */
export function mapSpotifyTrackToSong(track, index = 0) {
  if (!track) return null;
  const durationMs = track.duration_ms || 180000;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const durationStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const imageUrl =
    track.album?.images?.[0]?.url ||
    track.album?.images?.[1]?.url ||
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop";

  // Use preview_url if Spotify provides it; otherwise fallback to local high-fidelity audio track
  const fallbackAudio = `/audio/track-${(index % 8) + 1}.wav`;

  return {
    id: `spotify-${track.id}`,
    spotifyId: track.id,
    title: track.name,
    artist: track.artists ? track.artists.map((a) => a.name).join(", ") : "Unknown Artist",
    featured:
      track.artists && track.artists.length > 1
        ? `feat. ${track.artists.slice(1).map((a) => a.name).join(", ")}`
        : "",
    album: track.album?.name || "Single",
    duration: durationStr,
    imageUrl: imageUrl,
    audioUrl: track.preview_url || fallbackAudio,
    hasRealPreview: Boolean(track.preview_url),
    spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
    genre: "Spotify Hit",
    year: track.album?.release_date
      ? parseInt(track.album.release_date.slice(0, 4), 10)
      : 2024,
    isFavorite: false,
    streams: track.popularity
      ? (track.popularity * 14200000).toLocaleString()
      : "184,320,119",
  };
}

/**
 * Search tracks using Spotify Web API
 */
export async function searchSpotifyTracks(query) {
  if (!query || !isSpotifyConnected()) return [];
  try {
    const data = await spotifyRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
    if (data.tracks && Array.isArray(data.tracks.items)) {
      return data.tracks.items.map(mapSpotifyTrackToSong).filter(Boolean);
    }
  } catch (err) {
    console.warn("Spotify search error:", err);
  }
  return [];
}

/**
 * Fetch top user tracks from Spotify
 */
export async function fetchSpotifyUserTopTracks() {
  if (!isSpotifyConnected()) return [];
  try {
    const data = await spotifyRequest("/me/top/tracks?limit=25");
    if (data.items && Array.isArray(data.items)) {
      return data.items.map(mapSpotifyTrackToSong).filter(Boolean);
    }
  } catch (err) {
    console.warn("Spotify user top tracks error:", err);
  }
  return [];
}

/**
 * Fetch new releases and popular albums from Spotify
 */
export async function fetchSpotifyNewReleases() {
  if (!isSpotifyConnected()) return [];
  try {
    const data = await spotifyRequest("/browse/new-releases?limit=20");
    if (data.albums && Array.isArray(data.albums.items)) {
      return data.albums.items;
    }
  } catch (err) {
    console.warn("Spotify new releases error:", err);
  }
  return [];
}

/**
 * Live Music API Search & Top Tracks (Fallback & Live API provider)
 * Fetches real songs with 600x600 artwork and playable audio streams
 */
export async function searchLiveMusicApi(query, limit = 20) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${limit}`
    );
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((t, idx) => {
      const durationMs = t.trackTimeMillis || 180000;
      const min = Math.floor(durationMs / 60000);
      const sec = Math.floor((durationMs % 60000) / 1000);
      const dur = `${min}:${sec < 10 ? "0" : ""}${sec}`;
      const img = t.artworkUrl100
        ? t.artworkUrl100.replace("100x100bb", "600x600bb")
        : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop";

      return {
        id: `api-${t.trackId}`,
        title: t.trackName,
        artist: t.artistName,
        featured: t.artistName,
        album: t.collectionName || t.trackName,
        duration: dur,
        imageUrl: img,
        audioUrl: t.previewUrl || `/audio/track-${(idx % 8) + 1}.wav`,
        genre: t.primaryGenreName || "Pop",
        year: t.releaseDate ? parseInt(t.releaseDate.slice(0, 4), 10) : 2024,
        isFavorite: false,
        streams: (120000000 + (t.trackId % 800000000)).toLocaleString(),
      };
    });
  } catch (e) {
    console.warn("Live music API search error:", e);
    return [];
  }
}

/**
 * Fetches live songs from the Music API across top trending artists & categories
 */
export async function fetchLiveApiTracks() {
  const topQueries = [
    "John Legend",
    "The Weeknd",
    "Billie Eilish",
    "Dua Lipa",
    "Ed Sheeran",
    "Coldplay",
    "Taylor Swift",
    "B.B. King",
    "Daft Punk",
    "BTS",
  ];

  try {
    const results = await Promise.all(
      topQueries.map((query) => searchLiveMusicApi(query, 3))
    );
    const flat = results.flat();
    // Deduplicate by ID
    const seen = new Set();
    const unique = [];
    for (const song of flat) {
      if (!seen.has(song.id)) {
        seen.add(song.id);
        unique.push(song);
      }
    }
    return unique;
  } catch (err) {
    console.warn("Live API tracks error:", err);
    return [];
  }
}

/**
 * Unified loader: Fetches from Spotify API if connected, or loads live songs from Music API
 */
export async function fetchUnifiedApiTracks() {
  // 1. If Spotify client secret is provided in environment, attempt client credentials
  if (!isSpotifyConnected() && getSpotifyClientSecret()) {
    try {
      await fetchClientCredentialsToken();
    } catch (e) {
      console.warn("Client credentials attempt:", e);
    }
  }

  // 2. If Spotify is connected (via user PKCE or Client Credentials), fetch from Spotify Web API
  if (isSpotifyConnected()) {
    try {
      let tracks = await fetchSpotifyUserTopTracks();
      if (!tracks || tracks.length === 0) {
        tracks = await searchSpotifyTracks("Top Hits 2024");
      }
      if (tracks && tracks.length > 0) {
        return tracks;
      }
    } catch (e) {
      console.warn("Spotify API fetch failed, falling back to live music API:", e);
    }
  }

  // 3. Fallback: Load live songs from Live Music API
  return await fetchLiveApiTracks();
}
