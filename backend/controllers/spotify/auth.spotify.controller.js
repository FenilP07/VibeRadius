import axios from "axios";
import querystring from "querystring";
import generateRandomString from "../../utils/generateRandomString.js";
import { deflate } from "zlib";
import { asyncHandler } from "../../utils/asyncHandler.js";

const loginSpotifyController = async (req, res) => {
  var state = generateRandomString(16);
  var scopes = process.env.SPOTIFY_SCOPES;

  const spotifyAuthRedirect = "https://accounts.spotify.com/authorize?";
  res.redirect(
    spotifyAuthRedirect +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: state,
        show_dialog: true,
      })
  );
};

export default loginSpotifyController;
