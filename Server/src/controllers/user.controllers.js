import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'
import { User } from '../models/user.model.js'
import { validateToken } from '../utils/auth.js'

const generateAccessAndRefreshTokens = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        console.log("Access Token: ", accessToken);
        const refreshToken = user.generateRefreshToken();
        console.log("Refresh Token: ", refreshToken);

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(400, "Error while generating access and refresh tokens");
    }
}

const handleUserRegistration = asyncHandler( async (req, res) => {
    // validation
    // Get the user details from req body
    // If existing user, return
    // create new user
    // If profileImage / any other file uploaded, upload it to cloudinary 
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser){
        throw new ApiError(400, "User already exists");
    }

    // Upload profile pic if provided
    // console.log(req.file);

    const profileImageLocalPath = req.file?.path;
    console.log(profileImageLocalPath);

    let profileImage = null;
    if (profileImageLocalPath){
        // Upload image to cloudinary
        profileImage = await uploadFileToCloudinary(profileImageLocalPath);
        // console.log("Cloudinary response: ", profileImage);

        // Delete image from local storage

    }

    const user = await User.create({
        username: username,
        email: email,
        password: password,
        profileImage: profileImage?.url,
    });

    console.log("user: ", user);
    return res
        .status(201)
        .json(new ApiResponse(201, {
            username: username,
            email: email,
            profileImage: profileImage?.url,
            _id: user._id,
        }, "User successfully registered"));
});

const handleUserLogin = asyncHandler( async (req, res) => {
    // Fetch user data -> { email, password }
    // Get user
    // If !user return
    // verify password
    // generate access and refresh tokens
    // send them via secure cookies

    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user){
        throw new ApiError(400, "User does not exist");
    }

    const isSamePassword = await user.isCorrectPassword(password);
    console.log(isSamePassword);

    if (!isSamePassword){
        throw new ApiError(400, "Incorrect Password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: {
                username: user.username,
                email: user.email,
                _id: user._id,
                profileImage: user.profileImage
            },
            accessToken,
            refreshToken
        }, "User logged in successfully"));
});

const handleUserLogout = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ''
            }
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully")); 
});

const handleRefreshAccessToken = asyncHandler(async (req, res) => {
    // Fetch the client side refresh token
    // Decode the incoming refresh token to get the user id
    // Verify whether both the refresh tokens are the same
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access");
    }

    const decodedRefreshToken = validateToken(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user){
        throw new ApiError(401, "Refresh token invalid");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Access Token Refreshed"));

})

export {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
    handleRefreshAccessToken
}