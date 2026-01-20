import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import { createUniqueUsername } from "../utils/createUniqueUsername.js";
import {
  generateAccessRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAccessRefreshToken.js";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  path: "/",
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 15 * 1000,
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Register User

const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) throw new APIError(400, "Fill all fields!");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new APIError(400, "User already exists!");

  const username = await createUniqueUsername();
  const user = await User.create({ email, username, name, password });

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(
      new APIResponse(
        201,
        { user: createdUser },
        "User registered successfully!"
      )
    );
});

// LOGIN USER

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new APIError(400, "Email and password required!");

  const user = await User.findOne({ email });
  if (!user) throw new APIError(404, "User not found!");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new APIError(401, "Invalid credentials!");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(new APIResponse(200, { user: loggedInUser }, "Login successful!"));
});

// LOGOUT

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  res
    .status(200)
    .clearCookie("accessToken", BASE_COOKIE_OPTIONS)
    .clearCookie("refreshToken", BASE_COOKIE_OPTIONS)
    .json(new APIResponse(200, null, "Logged out successfully!"));
});

// REFRESH ACCESS TOKEN

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) throw new APIError(401, "Refresh token missing");

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie("accessToken", BASE_COOKIE_OPTIONS);
      res.clearCookie("refreshToken", BASE_COOKIE_OPTIONS);
      throw new APIError(401, "Invalid session");
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .cookie("accessToken", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      .cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
      .json(
        new APIResponse(200, { accessToken: newAccessToken }, "Token refreshed")
      );
  } catch (error) {
    res.clearCookie("accessToken", BASE_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", BASE_COOKIE_OPTIONS);
    throw new APIError(401, "Session expired");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new APIError(401, "User not found");

  res.status(200).json(new APIResponse(200, { user }, "User fetched"));
});

//HELPERS

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!user) throw new APIError(404, "User not found");
  res.status(200).json(new APIResponse(200, { user }, "User fetched"));
});

const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).select(
    "-password -refreshToken"
  );
  if (!user) throw new APIError(404, "User not found");
  res.status(200).json(new APIResponse(200, { user }, "User fetched"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new APIError(404, "User not found");

  await user.deleteOne();
  res
    .status(200)
    .clearCookie("accessToken", BASE_COOKIE_OPTIONS)
    .clearCookie("refreshToken", BASE_COOKIE_OPTIONS)
    .json(new APIResponse(200, null, "User deleted"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getUserById,
  getUserByEmail,
  deleteUser,
};
