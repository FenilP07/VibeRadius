import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import { createUniqueUsername } from "../utils/createUniqueUsername.js";
import { generateAccessRefreshToken } from "../utils/generateAccessRefreshToken.js";
import logger from "../utils/logger.js";

/**
 * REGISTER USER
 * Handles user registration by hashing the password, creating a new user,
 * and saving it to the database. Returns the saved user as JSON.
 *
 * @param {Object} req - Express request object, expects user data in req.body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const registerUser = asyncHandler(async (req, res) => {
  // get user email, and password from Form
  const { email, name, password } = req.body;

  // check input types
  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string"
  ) {
    throw new APIError(400, "Invalid input types!");
  }

  // validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new APIError(400, "Invalid email format!");
  }

  // validate password length
  const passwordMinLength = 6;
  const passwordMaxLength = 24;
  if (
    password.length < passwordMinLength ||
    password.length > passwordMaxLength
  ) {
    throw new APIError(
      400,
      `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long!`
    );
  }

  // check email and password field is not empty
  if (!email || !name || !password)
    throw new APIError(400, "Fill out all the fields to get registered!");

  // check whether user already exist in the database
  const existingUser = await User.findOne({ email: email });

  // throw an error if user exist
  if (existingUser) throw new APIError(400, "User already exist!");

  // genrate a random username
  const username = await createUniqueUsername();

  logger.info("Register user request received", {
    email,
    username,
    name,
  });

  // create a new user
  const user = await User.create({
    email: email,
    username: username,
    name: name,
    password: password,
  });

  logger.info("User created successfully", {
    userId: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
  });

  // generate tokens
  const { accessTokens, refreshTokens } = await generateAccessRefreshToken(
    user._id
  );

  logger.info("Tokens generated for user", {
    userId: user._id,
    accessTokens,
    refreshTokens,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send response
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("accessToken", accessTokens, options)
    .cookie("refreshToken", refreshTokens, options)
    .json(
      new APIResponse(
        200,
        {
          user: createdUser,
          accessTokens,
          refreshTokens,
        },
        "User registered successfully!"
      )
    );
});

/**
 * LOGIN USER
 * Handles user login by verifying credentials and generating access and refresh tokens.
 * Sets the tokens as HTTP-only cookies and returns user data along with tokens as JSON.
 *
 * @param {Object} req - Express request object, expects email and password in req.body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 **/
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check email and password field is not empty
  if (!email || !password)
    throw new APIError(400, "Fill out all the fields to login!");

  // find user by email
  const user = await User.findOne({ email: email });

  // if user not found
  if (!user) throw new APIError(404, "User not found!");

  // compare password
  const isMatch = await user.comparePassword(password);

  // if password does not match
  if (!isMatch) throw new APIError(401, "Invalid credentials!");

  // generate tokens
  const { accessTokens, refreshTokens } = await generateAccessRefreshToken(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send response
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessTokens, options)
    .cookie("refreshToken", refreshTokens, options)
    .json(
      new APIResponse(
        200,
        {
          user: createdUser,
          accessTokens,
          refreshTokens,
        },
        "User logged in successfully!"
      )
    );
});

/** * LOGOUT USER
 * Handles user logout by clearing the access and refresh token cookies.
 * Returns a success message as JSON.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 **/
const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new APIResponse(200, null, "User logged out successfully!"));
});

// GET USER BY ID
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new APIError(404, "User not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

// GET USER BY EMAIL
const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.params.email;

  const user = await User.findOne({ email: email }).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new APIError(404, "User not found");
  }

  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

// DELETE USER BY ID
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  await user.deleteOne();

  return res
    .status(200)
    .json(new APIResponse(200, null, "User deleted successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user; // <-- get from middleware
  if (!user) throw new APIError(401, "User not found");

  return res
    .status(200)
    .json(new APIResponse(200, { user }, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  getUserByEmail,
  deleteUser,
  getCurrentUser,
};
