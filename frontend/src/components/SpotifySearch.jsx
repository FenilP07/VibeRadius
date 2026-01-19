import { useState } from "react";
import { searchTrack } from "../services/SpotifyService.js";
import { Search, Music, Loader2, AlertCircle, PlayCircle, Plus } from "lucide-react";

export default function SpotifySearch() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const searchTracks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const items = await searchTrack(query);
      setTracks(items || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to reach Spotify. Please try again.");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchTracks();
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#5C4033]/40 flex items-center gap-2">
          <Search size={14} /> Add to Queue
        </h2>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="Search for a song or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="w-full bg-white/50 backdrop-blur-md border border-white px-5 py-4 pl-12 rounded-2xl outline-none focus:border-[#E07A3D] focus:ring-4 focus:ring-[#E07A3D]/5 transition-all text-[#5C4033] font-medium placeholder:text-[#5C4033]/30"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C4033]/30 group-focus-within:text-[#E07A3D] transition-colors" size={20} />
          
          <button
            onClick={searchTracks}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E07A3D] hover:bg-[#C4612A] disabled:bg-gray-300 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {tracks.length > 0 ? (
          tracks.map((track, index) => (
            <div
              key={track.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group bg-white/40 hover:bg-white/80 border border-white/50 p-3 rounded-2xl flex items-center justify-between transition-all hover:shadow-lg hover:shadow-[#5C4033]/5 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  {track.album?.images?.[0] ? (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FEF3EB] rounded-xl flex items-center justify-center text-[#E07A3D]">
                      <Music size={20} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                    <PlayCircle className="text-white" size={20} />
                  </div>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[#5C4033] truncate pr-4 group-hover:text-[#E07A3D] transition-colors">
                    {track.name}
                  </span>
                  <span className="text-xs font-medium text-[#5C4033]/50 truncate uppercase tracking-wider">
                    {track.artists.map((a) => a.name).join(", ")}
                  </span>
                </div>
              </div>

              {/* Fixed: Changed FaPlus to Plus */}
              <button className="bg-white border border-[#5C4033]/5 hover:border-[#E07A3D] text-[#5C4033] hover:text-[#E07A3D] p-2.5 rounded-xl transition-all shadow-sm active:scale-90">
                <Plus size={16} />
              </button>
            </div>
          ))
        ) : hasSearched && !loading ? (
          <div className="py-12 text-center bg-white/20 border border-dashed border-[#5C4033]/10 rounded-[2rem]">
            <Music className="mx-auto text-[#5C4033]/20 mb-3" size={32} />
            <p className="text-[#5C4033]/40 font-bold uppercase text-xs tracking-widest">No tracks found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}