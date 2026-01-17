import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { isLoggedIn };
