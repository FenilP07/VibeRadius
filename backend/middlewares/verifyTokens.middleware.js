import jwt from 'jsonwebtoken'
import { APIError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler'

export const verifyAccessToken = asyncHandler(async (req, _, next) => {
    
    // get the accessToken
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    //check the token is in correct format
    if(!token) throw APIError(400, "Failed to get AccessToken :<")
    
    // verify the token is valid
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    // 
})