import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'
import { Video } from '../models/video.model.js'

// Functionalities to be added:
// 1. getAllVideos
// 2. publishVideo
// 3. fetchVideoById
// 4. updateVideoDetails
// 5. deleteVideo
// 6. togglePublishStatus

const getAllVideos = asyncHandler(async (req, res) => {

});

const publishVideo = asyncHandler(async (req, res) => {
    // Fetch title, owner details, description, video
    const { title, description } = req.body;

    const videoLocalPath = req.files[0]?.path;
    const thumbnailLocalPath = req.files[1]?.path;

    if (!videoLocalPath){
        throw new ApiError(404, "Video does not exist");
    }

    const videoUploadResponse = await uploadFileToCloudinary(videoLocalPath);
    const thumbnailUploadResponse = await uploadFileToCloudinary(thumbnailLocalPath);

    if (!videoUploadResponse || !thumbnailUploadResponse) {
        throw new ApiError(400, "Could not upload to cloudinary");
    }

    console.log(videoUploadResponse);

    const video = await Video.create({
        title: title,
        description: description,
        owner: req.user?._id,
        duration: videoUploadResponse?.duration,
        videoFile: videoUploadResponse?.url,
        isPublished: true
    });

    if (!video){
        throw new ApiError(400, "Error while publishing video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video){
        throw new ApiError(404, "Video does not exist");
    }

    return res
        .status(200)
        .json(200, video, "Video fetched successfully");
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }

    const { title, description } = req.body;

    if (title) video.title = title;

    if (description) video.description = description;

    const thumbnailLocalPath = req.file?.path;

    let cloudinaryResponse;
    if (thumbnailLocalPath){
        const publicId = req.user?.profileImageUrl.split('/').pop().split('.')[0];

        cloudinaryResponse = await uploadFileToCloudinary(thumbnailLocalPath, publicId);
    }

    video.thumbnail = cloudinaryResponse?.url;

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cloudinaryResponse?.url, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Could not update video successfullyy details");
    }
    const video = await Video.findById(videoId);
    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(200, {}, "Video status toggled successfully");
});

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}