import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import SpotifyToken from "../models/spotifyToken.model.js";
import { APIError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";


export const refreshSpotifyToken = asyncHandler(async (req, res, next) => {
    
    const userId = req.user._id;
    console.log(`--------- ${userId}`)
    // get accessToken, refreshToken from DB based on user id
    const currentToken = await SpotifyToken.findOne({userId});

    // validate
    if (!currentToken) {
        throw new APIError(404, 'No Spotify Token Found for this user');
    };

    // extract token and exp time
    const { accessToken, refreshToken, expiresAt } = currentToken;

    // if token is still valid -> early exit
    if (expiresAt && new Date(expiresAt) > new Date(Date.now() + 5 * 60 * 1000)) {

        // valid for at least next 5 min
        logger.debug(`Token still valid until; ${expiresAt} for user ${userId}`);

        // NOT SURE ABOUT RETURNING THIS
        return { accessToken, refreshToken, expiresAt }
    }

    const tokenURI = process.env.SPOTIFY_TOKEN_URI;
    const clientId = process.env.SPOTIFY_CLIENT_ID;

    // body for request
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,

    }).toString();


    const basicAuth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    // get response
    const response = await axios.post(tokenURI, body, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
        },
        timeout: 10000,
    })

    //  SAMPLE RESPONSE

    // {
    //     access_token: 'BQBLuPRYBQ...BP8stIv5xr-Iwaf4l8eg',
    //     token_type: 'Bearer',
    //     expires_in: 3600,
    //     refresh_token: 'AQAQfyEFmJJuCvAFh...cG_m-2KTgNDaDMQqjrOa3',
    //     scope: 'user-read-email user-read-private'
    // }


    // get new aceess token and refresh token
    const{
            access_token: newAccessToken,
            refresh_token: newRefreshToken,  
            expires_in: expiresIn,
            scope: newScope,
        } = response.data;

    // calculate new exp time
    const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // update new aceess token and refresh token and set new exp time

    const updated = await SpotifyToken.findOneAndUpdate(
        { userId },
        {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken, // keep old if not rotated
            expiresAt: newExpiresAt,
            scope: newScope || currentToken.scope,
            lastRefreshed: new Date(),
        },
        { new: true, upsert: false }
    )


    if(!updated){
        throw new APIError(500, 'Failed to refresh spotify token');
    }

    logger.info(`Spotifty token refresh fro ${userId} till ${newExpiresAt}`);

    return {
    accessToken: newAccessToken,
    expiresAt: newExpiresAt,
    scope: newScope || scope,
  };



})

