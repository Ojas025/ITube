import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'

// Functionalities to be added:
// 1. getVideoComments
// 2. postComment
// 3. deleteComment
// 4. updateComment
// 5. getUserComments