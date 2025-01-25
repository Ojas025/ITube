import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary, deleteFileFromCloudinary } from '../services/cloudinary.js'
import { Video } from '../models/video.model.js'
import { User } from '../models/user.model.js'

// Functionalities to be added:
// 1. getAllVideos
// 2. publishVideo --> ✅
// 3. fetchVideoById --> ✅
// 4. updateVideoDetails --> ✅
// 5. deleteVideo --> ✅
// 6. togglePublishStatus --> ✅

const getAllVideos = asyncHandler(async (req, res) => {
    // Pending
});

const publishVideo = asyncHandler(async (req, res) => {
    // Fetch title, owner details, description, video
    const { title, description } = req.body;

    const videoLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!videoLocalPath){
        throw new ApiError(404, "Video is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(404, "Thumbnail is required");
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
        isPublished: true,
        videoFile: {
            url: videoUploadResponse?.url,
            public_id: videoUploadResponse?.public_id
        },
        thumbnail: {
            url: thumbnailUploadResponse?.url,
            public_id: thumbnailUploadResponse?.public_id
        }
    });

    if (!video){
        throw new ApiError(400, "Error while publishing video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    // User clicked on a video
    // Add to watch history
    // Increment views
    const { videoId } = req.params;

    // thumbnail
    // title
    // desc
    // likes (like model)
    // views + 1
    // owner details (user model)
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },

                    {
                        $addFields: {
                            subscribers: {
                                $size: "$subscribers"
                            },

                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [req.user?._id, "$subscribers.subscriber"]
                                    },
                                    then: true,
                                    else: false 
                                }
                            }
                        }
                    },

                    {
                        $project: {
                            username: 1,
                            profileImageUrl: 1,
                            subscribers: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {

                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                },

                likes: {
                    $size: "$likes"
                },

                owner: {
                    $first: "$owner",
                },

            }
        },

        {
            $project: {
                owner: 1,
                likes: 1,
                isLiked: 1,
                isSubscribed: 1,
                subscribers: 1,
                duration: 1,
                comments: 1,
                views: 1,
                title: 1,
                description: 1,
                profileImageUrl: 1,
                createdAt: 1
            }
        }
    ])

    // Append video id to watch history
    // Increment likes count

    if (!video){
        throw new ApiError(404, "Video does not exist");
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet: {
                watchHistory: videoId
            }
        }
    );

    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        }
    );

    return res
        .status(200)
        .json(200, video[0], "Video fetched successfully");
});

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }

    if (req.user?._id.toString() !== video?.owner.toString()){
        throw new ApiError(400, "You are not authorized to update this video");
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

    if (!cloudinaryResponse){
        throw new ApiError(400, "Error in updating video");
    }

    // Delete the previous thumbnail from cloudinary
    await deleteFileFromCloudinary(video.thumbnail.public_id);

    video.thumbnail = {
        url: cloudinaryResponse?.url,
        public_id: cloudinaryResponse?.public_id
    };

    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video){
        throw new ApiError(404, "Video does not exist");
    }

    if (req.user?._id.toString() !== video.owner.toString()){
        throw new ApiError(400, "You are not authorized to delete this video");
    }

    const deleteResponse = await Video.findByIdAndDelete(videoId);

    if (!deleteResponse){
        throw new ApiError(400, "Error deleting video");
    }

    await deleteFileFromCloudinary(video.videoFile.public_id, "video"); // Delete video from cloudinary
    await deleteFileFromCloudinary(video.thumbnail.public_id); // Delete thumbnail from cloudinary

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

    if (!video){
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video?.isPublished;

    await video.save();

    return res
        .status(200)
        .json(200, { isPublished: video?.isPublished }, "Video status toggled successfully");
});

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}