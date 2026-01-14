import apiClient from "../utils/apiClient.js";

const searchTrack = async (query) => {
  const response = await apiClient.get("/spotify/search", {
    params: { q: query },
  });

  return response.data.data.tracks.items;
};

export { searchTrack };
