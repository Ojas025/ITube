import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'
import { User } from '../models/user.model.js'

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
    // Fetch user data
    // 


    const { email, password } = req.body;
})

export {
    handleUserRegistration
}