import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  // 1. Check if cookies are actually reaching the server
  const token = req.cookies?.accessToken;

  if (!token) {
    console.log("[Auth Middleware] No accessToken found in cookies");
    throw new APIError(401, "Access token missing. Please log in.");
  }

  try {
    // 2. Attempt to decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user and attach to request
    const user = await User.findById(decoded._id).select("-password -refreshToken");
    
    if (!user) {
      throw new APIError(401, "User not found. Invalid session.");
    }

    req.user = user;
    next();
  } catch (error) {
    // 4. Specific Error Logging
    console.error(`[Auth Middleware] JWT Error: ${error.message}`);
    
    if (error.name === "TokenExpiredError") {
      throw new APIError(401, "Token expired. Please refresh.");
    }
    
    throw new APIError(401, "Token invalid. Please log in again.");
  }
});

<<<<<<< HEAD
export { isLoggedIn };
=======
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
>>>>>>> 60ed990 (intialized to sockets for both forntend and backend token validation needs work whcih will happne after merging)
