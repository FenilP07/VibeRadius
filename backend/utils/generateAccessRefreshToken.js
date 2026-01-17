import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "./ApiError.js"

// Generate Access Token
const generateAccessToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

//  Access and Refresh Token and save refresh token in database
const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessTokens = await generateAccessToken(user);
        const refreshTokens = await generateRefreshToken(user);

        user.refreshToken = refreshTokens;
        await user.save({ validateBeforeSave: false });

        return { accessTokens, refreshTokens };

    } catch (error) {
        throw new APIError(500, "Token generation failed!");
    }
}

export {
    generateAccessRefreshToken
}