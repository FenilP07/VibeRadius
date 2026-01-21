import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessRefreshToken } from "../utils/generateAccessRefreshToken.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new APIError(401, "Unauthorized. Please login.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new APIError(401, "Invalid or expired access token.");
  }

  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new APIError(401, "User not found.");
  }

  req.user = user;
  next();
});

const autoGenerateRefreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new APIError(401, "Unauthorized. Please login.");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    throw new APIError(401, "Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded._id);
  if( !user || user.refreshToken !== refreshToken) {
    throw new APIError(401, "User not found or token mismatch.");
  }

  const { refreshTokens } = await generateAccessRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };
  
  res
    .status(200)
    .cookie("refreshToken", refreshTokens, options);

  next();
});

export { isLoggedIn, autoGenerateRefreshToken };
