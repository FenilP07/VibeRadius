import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import APIError from "../utils/ApiError.js";

const userRegister = asyncHandler(async (req, res, next) => {

  // get user email, and password from Form
  const { email, name, password } = req.body;

  // check email and password field is not empty
  if (!email || !name || !password)
    throw new APIError(400, "Fill out all the fields to get registered!");

  // check whether user already exist in the database
  const existingUser = User.findOne({ email: email });

  // throw an error if user exist
  if (existingUser) throw new APIError(400, "User alraedy exist!");

  // generate the token


  // save the user
});
