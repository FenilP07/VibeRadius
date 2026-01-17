import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "./ApiError.js"

// Generate Access Token
const generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Generate Access and Refresh Token and save refresh token in database
const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessTokens = await generateAccessToken.call(user);
        const refreshTokens = await generateRefreshToken.call(user);

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