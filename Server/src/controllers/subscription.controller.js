import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'

// Functionalities to be added:
// 1. toggleSubscription
// 2. getAllSubscribers
// 3. getAllSubscriptions