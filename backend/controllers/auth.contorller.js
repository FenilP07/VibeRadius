import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import {APIError} from "../utils/ApiError.js";
import {APIResponse} from "../utils/ApiResponse.js";
import { createUniqueUsername } from "../utils/createUniqueUsername.js";

/**
 * REGISTER USER
 * Handles user registration by hashing the password, creating a new user,
 * and saving it to the database. Returns the saved user as JSON.
 * 
 * @param {Object} req - Express request object, expects user data in req.body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */

const registerUser = asyncHandler(async (req, res, next) => {

  // get user email, and password from Form
  const { email, name, password } = req.body;

  // check input types
  if (typeof email !== 'string' || typeof name !== 'string' || typeof password !== 'string') {
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
  if (password.length < passwordMinLength || password.length > passwordMaxLength) {
    throw new APIError(400, `Password must be between ${passwordMinLength} and ${passwordMaxLength} characters long!`);
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

  // create a new user
  const newUser = new User.create({
    email,
    username,
    name,
    password,
  });

  // generate tokens
  const { accessTokens, refreshTokens } = await newUser.generateAccessRefreshToken();

  // save the user
  await newUser.save();

  // send response
  options = {
    httpOnly: true,
    secure: true,
  }

  res
  .status(201)
  .cookie("accessToken", accessTokens, options)
  .cookie("refreshToken", refreshTokens, options)
  .json(
    new APIResponse(
      200,
      {
        user: newUser, accessTokens, refreshTokens
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
const loginUser = asyncHandler(async (req, res, next) => {
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
  const { accessTokens, refreshTokens } = await user.generateAccessRefreshToken();

  // send response
  const options = {
    httpOnly: true,
    secure: true,
  }
  
  res
    .status(200)
    .cookie("accessToken", accessTokens, options)
    .cookie("refreshToken", refreshTokens, options)
    .json(
      new APIResponse(
        200,
        {
          user: user, accessTokens, refreshTokens
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
const logoutUser = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
      new APIResponse(
        200,
        null,
        "User logged out successfully!"
      )
    );
});

export { registerUser, loginUser, logoutUser };