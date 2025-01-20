import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validateToken } from '../utils/auth.js'
import { ApiError } from '../utils/ApiError.js';

const checkAuthentication = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const payload = validateToken(token);
        req.user = payload;
        next();
    }
    catch(error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

export {
    checkAuthentication
}