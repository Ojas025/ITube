import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'

// Functionalities to be added:
// 1. createPlaylist
// 2. getUserPlaylists (user._id)
// 3. getPlaylistById (playlist._id)
// 4. addVideoToPlaylist
// 5. removeVideoFromPlaylist
// 6. deletePlaylist