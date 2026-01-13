import axios from "axios";

let accessToken = null;
let tokenExpiresAt = null;

async function getSpotifyToken() {
  // get current time
  let now = Date.now();

  // if token exist and not expired, re-use it

  if (accessToken && tokenExpiresAt && now < tokenExpiresAt) {
    return accessToken;
  }

  const spotify_token_url = "https://accounts.spotify.com/api/token";
  // response
  // {
  //     "access_token": "BQDBKJ5eo5jxbtpWjVOj7ryS84khybFpP_lTqzV7uV-T_m0cTfwvdn5BnBSKPxKgEb11",
  //     "token_type": "Bearer",
  //     "expires_in": 3600
  // }

  // token not exist or expired
  const response = await axios.post(
    spotify_token_url,
    new URLSearchParams({
      grant_type: "client_credentials",
    }),

    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000;

  return accessToken;
}

export { getSpotifyToken };
