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
            $unset: {
                refreshToken: 1 // This removes the flagged field from the document
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

const handleGetChannelData = asyncHandler(async (req, res) => {
    // What do i need?
    // username ( channel owner username )
    // email
    // profileImageUrl ( cloudinary url )
    // subscriber count (use aggregation queries)
    // subscription count ( use aggregation queries )
    // channel videos ( cloudinary urls )
    // isSubscribed => (req.user._id === subscription.subscriber._id)
    
    const { username } = req.params;

    if (!username?.trim()){
        throw new ApiError(404, "username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },

        {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels"
            }
        },

        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },

                subscriptionCount: {
                    $size: "subscribedChannels"
                },

                isSubscribed: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else:  false
                }
            }
        },

        {
            $project: {
                username: 1,
                profileImageUrl: 1,
                subscriberCount: 1,
                subscriptionCount: 1,
                isSubscribed: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length){
        throw new ApiError(404, "Channel does not exist");
    }

    console.log(channel);
    
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel details fetched successfully")); 
});

const handleGetUserWatchHistory = asyncHandler(async (req, res) => {
    const watchHistoryResponse = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        profileImageUrl: 1,
                                    }
                                },

                                {
                                    $addFields: {
                                        owner: {
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },

        {
            $project: {
                watchHistory: 1
            }
        }
    ]);

    if (!watchHistoryResponse?.length || !watchHistoryResponse[0]){
        throw new ApiError(404, "Empty watch history");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, watchHistoryResponse[0], "Watch History fetched successfully"));
});

export {
    handleUserRegistration,
    handleUserLogin,
    handleUserLogout,
    handleRefreshAccessToken,
    handleChangeUserPassword,
    getCurrentUser,
    handleUpdateAccountDetails,
    handleUpdateProfileImage,
    handleGetChannelData,
    handleGetUserWatchHistory,
}