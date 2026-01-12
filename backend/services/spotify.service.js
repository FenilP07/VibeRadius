import dotenv from "dotenv"; 
dotenv.config();
import axios from "axios";
import { getSpotifyToken } from "../configs/spotify.config.js";

// function to attach token in request header
async function authHeaders() {

    // get token
    const token = await getSpotifyToken();

    return{
        Authorization: `Bearer  ${token}`
    };
}

const base_url = process.env.SPOTIFY_API_BASE

// search song
// curl --request GET \
//   --url 'https://api.spotify.com/v1/search?q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis&type=album' \
//   --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'


export async function searchTrack(query){

    const headers = await authHeaders();

    // request and get the response

    const response = await axios.get(`${base_url}/search`, {
        headers,
        params:{
            q: query,
            type: "track",
            limit: 20,
        }
    });

    return response.data;
}





