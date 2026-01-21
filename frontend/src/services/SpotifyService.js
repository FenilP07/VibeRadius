import apiClient from "../utils/apiClient.js";

const searchTrack = async (query) => {
  const response = await apiClient.get("/api/spotify/search", {
    params: { q: query },
  });

  return response.data.data.tracks.items;
};


// Spotify Login

const loginSpotify = async () => {
  const response = await apiClient.get("/auth/spotify/login");

  return response;
}


export { searchTrack, loginSpotify };
