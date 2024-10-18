import jwt from 'jsonwebtoken'
import { ApiError } from "../utils/ApiError.js";
import { ACCESS_TOKEN_SECRET } from '../constants.js';
import UserModel from '../models/user.js';
import { asyncHandler } from '../utils/asyncHandler.js';



export const auth = asyncHandler(async (req, res, next) => {
    try {
        const cookieHeader = req.headers.cookie;
        const token = cookieHeader.split(";")[0].split("=")[1];
        if (!token) {
            throw new ApiError("Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const user = await UserModel.findById(decodedToken?.id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})