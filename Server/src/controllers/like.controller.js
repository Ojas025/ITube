import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'

// Functionalities to be added:
// 1. toggleVideoLike
// 2. toggleCommentLike
// 3. toggleTweetLike
// 4. getLikedVideos
// 5. getLikedComments
// 6. getLikedTweets