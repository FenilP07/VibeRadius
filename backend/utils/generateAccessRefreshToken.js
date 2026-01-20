import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { APIError } from "./ApiError.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

const generateAccessRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new APIError(404, "User not found");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save new refresh token to DB (rotation)
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateAccessRefreshToken,
};
