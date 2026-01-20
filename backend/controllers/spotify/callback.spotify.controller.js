import express from 'express';
import logger from '../../utils/logger.js';
import { APIError } from '../../utils/ApiError.js';
import axios from 'axios';
import querystring from 'querystring';
import SpotifyToken from '../../models/spotifyToken.model.js';
import User from '../../models/user.model.js'

// to get the code which comes after user login from spotify auth screen
// we will use this code and state to get the access token, refresh token, exp time
const handleSpotifyCallback = async(req, res) => {

    // get code and state from the request

    const {code, state} = req.query;

    logger.info(`User info in handleSpotifyCallback ${req.user}`)
    if (state === null) {
    throw new APIError(400, 'State mismatch!');
    }

    if (!code) {
        throw new APIError(400, 'No authorization code received');
    }



        var tokenURL = 'https://accounts.spotify.com/api/token';
        
        const body = querystring.stringify({

            code: code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            grant_type: 'authorization_code'

        })

        const basicAuth = Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64");



        try {

            const response = await axios.post(tokenURL, body, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded", 
                    Authorization: "Basic " + basicAuth,
                }
            },

            );

            


            const { access_token, token_type, expires_in, refresh_token } = response.data;
            
            const scope = process.env.SPOTIFY_SCOPES

            // Calculate expiration time
            const expiresAt = new Date( Date.now() + expires_in * 1000);

            // get user id
            // TODO -- Replace this part with JWT later
            // once we finish with user authentication
            const userId = req.user?._id;


            if( !userId ){
                return res.redirect('/auth/login');  // redirect to app login screen
            } 

            // Update Databse

            const isUser = await User.findOne({ _id: userId })
            logger.info(`User found: ${JSON.stringify(isUser)}`);


            await SpotifyToken.findOneAndUpdate(
                { userId: userId },
                {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    expiresAt,
                    scope,
                    updatedAt: Date.now()
                },
                { upsert: true, new: true}
            )

            logger.info(`Spotify tokens saved for user ${userId}`);

            // Redirect to dashboard or queue page 
            // return res.redirect('/dashboard?spotify=connected');
            return res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard?spotify=connected`);


        } catch (err){
            logger.error('Token exchange failed:', err.response?.data || err.message);
            return res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard?spotify=error&message=connection_failed`);
        }
    

}


export default handleSpotifyCallback;