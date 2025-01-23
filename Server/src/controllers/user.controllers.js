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
    try {
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
    } catch (error) {
        throw new ApiError(400, error.message);   
    }
});

const handleChangeUserPassword = asyncHandler(async (req, res) => {
    // JWT verification
    // Fetch current password entered form req.body
    // Fetch the user
    // Verify if the passwords match
    // If not, return an error
    // If yes, update the password 
    const { oldPassword, newPassword } = req.body;

    if (oldPassword === newPassword) {
        throw new ApiError(400, "No changes in password detected");
    }

    if (!oldPassword || !newPassword) {
        throw new ApiError(404, "All fields are compulsary");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.isCorrectPassword(oldPassword)){
        // Entered old password matches
        // update the password
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
    }
    else{
        throw new ApiError(400, "Invalid Old Password");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler((req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully");
});

const handleUpdateAccountDetails = asyncHandler(async (req,res) => {
    // Think of something else for email updation
    if (!req.body) {
        throw new ApiError(400, "Empty request body");
    }

    const user = await findByIdAndUpdate(
        req.user?._id,
        req.body,
        { new: true }
    ).select("-password");

    return res
        .status(202)
        .json(new ApiResponse(202, user, "User details updated successfully"));
});

const handleUpdateProfileImage = asyncHandler(async (req, res) => {
    const newProfileImageLocalPath = req.file?.path;

    if (!newProfileImageLocalPath){
        throw new ApiError(404, "Image not found");
    }

    // Upload to cloudinary
    // The cloudinary public id is embedded in the url
    const publicId = req.user?.profileImageUrl.split('/').pop().split('.')[0];

    // Upload the file to cloudinary with the same public id
    // The cache update may take some time
    const cloudinaryResponse = await uploadFileToCloudinary(newProfileImageLocalPath, publicId);

    return res
        .status(200)
        .json(new ApiResponse(200, { profileImageUrl: cloudinaryResponse.url } , "Profile Image updated successfully! Update may take some time to display"));
})

export {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
    handleRefreshAccessToken,
    handleChangeUserPassword,
    getCurrentUser,
    handleUpdateAccountDetails,
    handleUpdateProfileImage
}