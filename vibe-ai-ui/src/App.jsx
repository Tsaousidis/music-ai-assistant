import { useMemo, useState } from "react";
import "./index.css";

const API_BASE = "http://localhost:3000";

function SongRow({ song, index }) {
  return (
    <div className="song-row">
      <div className="song-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="song-meta">
        <div className="song-title">{song.title}</div>
        <div className="song-artist">{song.artist}</div>
      </div>
      <a
        className="song-link"
        href={song.youtubeSearchUrl}
        target="_blank"
        rel="noreferrer"
      >
        YouTube
      </a>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState(null);

  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [loadingRefine, setLoadingRefine] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const [error, setError] = useState("");
  const [playlistSuccess, setPlaylistSuccess] = useState(null);

  const canRefine = useMemo(
    () => Boolean(sessionId && result?.songs?.length),
    [sessionId, result]
  );

  async function handleRecommend(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setError("");
    setPlaylistSuccess(null);
    setLoadingRecommend(true);

    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate recommendations");
      }

      setSessionId(data.sessionId);
      setResult({
        detectedTitle: data.detectedTitle,
        detectedArtist: data.detectedArtist,
        playlistName: data.playlistName,
        songs: data.songs
      });
      setRefinePrompt("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingRecommend(false);
    }
  }

  async function handleRefine(e) {
    e.preventDefault();
    if (!canRefine || !refinePrompt.trim()) return;

    setError("");
    setPlaylistSuccess(null);
    setLoadingRefine(true);

    try {
      const response = await fetch(`${API_BASE}/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          prompt: refinePrompt.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to refine recommendations");
      }

      setResult({
        detectedTitle: data.detectedTitle,
        detectedArtist: data.detectedArtist,
        playlistName: data.playlistName,
        songs: data.songs
      });
      setRefinePrompt("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingRefine(false);
    }
  }

  async function handleCreatePlaylist() {
    if (!canRefine) return;

    setError("");
    setPlaylistSuccess(null);
    setLoadingPlaylist(true);

    try {
      const response = await fetch(`${API_BASE}/playlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create playlist");
      }

      setPlaylistSuccess({
        playlistName: data.playlistName,
        playlistUrl: data.playlistUrl,
        user: data.user
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoadingPlaylist(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="bg-orb orb-top-right" />
      <div className="bg-orb orb-bottom-left" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">~</div>
          <div>
            <div className="brand-title">Vibe AI</div>
            <div className="brand-subtitle">Discover music through AI</div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>
            Find your <span>perfect rhythm</span>
          </h1>
          <p>
            Enter a song, get AI-powered recommendations, refine the vibe, and
            turn the result into a Spotify playlist.
          </p>

          <form className="hero-form" onSubmit={handleRecommend}>
            <input
              type="text"
              placeholder="Enter a song (e.g. The Weeknd - Blinding Lights)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loadingRecommend}
            />
            <button type="submit" disabled={loadingRecommend || !query.trim()}>
              {loadingRecommend ? "Generating..." : "Generate Recommendations"}
            </button>
          </form>
        </section>

        {error ? <div className="error-box">{error}</div> : null}

        {result ? (
          <section className="results-grid">
            <aside className="seed-card">
              <div className="seed-badge">Now analyzing</div>
              <div className="seed-art">
                <div className="seed-art-glow" />
              </div>
              <div className="seed-copy">
                <h2>{result.detectedTitle}</h2>
                <p>{result.detectedArtist}</p>
              </div>
              <div className="seed-footer">
                <span>AI playlist</span>
                <strong>{result.playlistName}</strong>
              </div>
            </aside>

            <div className="main-panel">
              <div className="panel-header">
                <div>
                  <h3>{result.playlistName}</h3>
                  <p>10 tracks curated for this vibe</p>
                </div>
              </div>

              <div className="songs-list">
                {result.songs.map((song, index) => (
                  <SongRow key={`${song.title}-${song.artist}-${index}`} song={song} index={index} />
                ))}
              </div>

              <form className="refine-card" onSubmit={handleRefine}>
                <div className="refine-header">
                  <h4>Refine the vibe</h4>
                  <p>
                    Try prompts like: darker, more synthwave, less mainstream,
                    female vocals
                  </p>
                </div>

                <div className="refine-actions">
                  <input
                    type="text"
                    placeholder="e.g. darker, more synthwave, less pop..."
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    disabled={loadingRefine}
                  />
                  <button
                    type="submit"
                    disabled={loadingRefine || !refinePrompt.trim()}
                  >
                    {loadingRefine ? "Refining..." : "Refine"}
                  </button>
                </div>

                <div className="chips">
                  {[
                    "More cinematic",
                    "Less mainstream",
                    "Female vocals",
                    "Darker",
                    "More synthwave"
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className="chip"
                      onClick={() => setRefinePrompt(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </form>

              <div className="playlist-card">
                <div>
                  <h4>Love this vibe?</h4>
                  <p>Save these recommendations directly to Spotify.</p>
                </div>

                <div className="playlist-actions">
                  <button
                    className="spotify-button"
                    onClick={handleCreatePlaylist}
                    disabled={loadingPlaylist}
                  >
                    {loadingPlaylist
                      ? "Creating playlist..."
                      : "Create Spotify Playlist"}
                  </button>

                  {playlistSuccess ? (
                    <div className="success-box">
                      <div className="success-title">
                        Playlist created for {playlistSuccess.user}
                      </div>
                      <a
                        href={playlistSuccess.playlistUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Playlist
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="empty-state">
            <div className="empty-card">
              <h3>Start with a song</h3>
              <p>
                Your recommendations, refinements, and Spotify playlist will
                appear here.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}