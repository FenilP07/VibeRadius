const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { useState } from "react";
import { searchTrack } from "../services/SpotifyService.js";

export default function SpotifySearch() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const searchTracks = async () => {
    if (!query.trim()) return alert("Enter a search term");

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const items = await searchTrack(query);
      setTracks(items || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error fetching tracks");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchTracks();
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Spotify Track Search</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter track name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          style={{
            padding: "0.5rem",
            width: "300px",
            marginRight: "0.5rem",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={searchTracks}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
        {tracks.length > 0 ? (
          tracks.map((track) => (
            <li
              key={track.id}
              style={{
                marginBottom: "0.5rem",
                padding: "0.5rem",
                backgroundColor: "#fff",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {track.album?.images?.[2] && (
                <img
                  src={track.album.images[2].url}
                  alt={track.album.name}
                  style={{ width: "64px", height: "64px", borderRadius: "4px" }}
                />
              )}
              <div>
                <div style={{ fontWeight: "bold" }}>{track.name}</div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {track.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </li>
          ))
        ) : hasSearched && !loading ? (
          <li>No tracks found.</li>
        ) : null}
      </ul>
    </div>
  );
}
