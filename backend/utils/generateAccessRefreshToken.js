import User from "../models/user.model.js";
import { APIError } from "./ApiError.js"

const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessTokens = await user.generateAccessToken();
        const refreshTokens = await user.generateRefreshToken();

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