import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new APIError(401, "Access token missing. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new APIError(401, "User not found. Invalid session.");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new APIError(401, "Token invalid or expired. Please log in again.");
  }
});

export { isLoggedIn };
