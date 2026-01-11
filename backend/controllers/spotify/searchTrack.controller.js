import { searchTrack } from "../../services/spotify.service.js";
import { APIError } from "../../utils/ApiError.js";


// POST /api/spotify/search?q=eni bonne HTTP/1.1
// Host: localhost:3000

export async function searchTrackController( req, res) {
    try {

        // search query from user
        const { q } = req.query;

        // validate query
        if(!q || q.trim() == ""){
            throw new APIError(400, "Search Query Required!")
        }

        const data = await searchTrack(q);

        res.json(data)


    } catch (err) 
    { 
        console.error("Spotify search controller error:", err.message); 
        throw new APIError(500, "Spotify Controller Error");
    }
}