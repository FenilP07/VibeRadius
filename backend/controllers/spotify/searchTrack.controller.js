import { searchTrack } from "../../services/spotify.service.js";
import { APIError } from "../../utils/ApiError.js";
import { APIResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// POST /api/spotify/search?q=eni bonne HTTP/1.1
// Host: localhost:3000

// export async function searchTrackController(req, res) {
//   try {
//     // search query from user
//     const { q } = req.query;

//     // validate query
//     if (!q || q.trim() == "") {
//       throw new APIError(400, "Search Query Required!");
//     }

//     const data = await searchTrack(q);

//     res.json(data)``;
//   } catch (err) {
//     console.error("Spotify search controller error:", err.message);
//     throw new APIError(500, "Spotify Controller Error");
//   }
// }

const searchTrackController = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() == "") throw new APIError(400, "Search Query Required");

  const data = await searchTrack(q);

  return res
    .status(201)
    .json(new APIResponse(201, data, "Song retrieved succesfully"));
});

export { searchTrackController };
