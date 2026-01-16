import express from 'express';
import logger from '../../utils/logger.js';
import { APIError } from '../../utils/ApiError.js';
import axios from 'axios';
import querystring from 'querystring';

// to get the code which comes after user login from spotify auth screen
// we will use this code and state to get the access token, refresh token, exp time

const handleSpotifyCallback = async(req, res) => {

    // get code and state from the request

    const {code, state} = req.query;

    if( state === null ){

        
        throw new APIError(400, "State mismatch!");

    } else {

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
            

            return res.json({ access_token, refresh_token, expires_in, });

        } catch (err){
            console.error(err.response?.data || err);
             return res.redirect( "/#" + querystring.stringify({ error: "invalid_token", }) );
        }

    }

}


export default handleSpotifyCallback;