import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Video } from '../models/video.model.js';
import { Subscription } from '../models/subscription.model.js';

// Functionalities to be added:
// 1. getChannelStats (views, subscribers, videoCount, likes, owner details)
// 2. getChannelVideos

const getChannelStats = asyncHandler(async (req, res) => {
    const videoDetails = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            },
        },

        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1 
            },
        },

        {
            $group: {
                _id: null,

                totalLikes: {
                    $sum: "$totalLikes"
                },

                totalVideos: {
                    $sum: 1,
                },

                totalViews: {
                    $sum: "$totalViews"
                }
            },
        },
    ]);

    const subscriberDetails = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        {
            $group: {
                _id: null,
                subscriberCount: {
                    $sum: 1,
                },
            },
        },
    ]);

    const channelDetails = {
        views: videoDetails[0].totalViews || 0,
        likes: videoDetails[0].totalLikes || 0,
        videos: videoDetails[0].totalVideos || 0,
        subscribers: subscriberDetails[0].subscriberCount || 0,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, channelDetails, "Channel Details fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },

        {
            $lookup: {
                // likes
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },

        {
            $addField: {
                likes: {
                    $size: "$likes"
                },
            }
        },

        {
            $project: {
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                duration: 1,
                createdAt: 1,
                owner: 1,
                isPublished: 1,
                likes: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(200, videos, "Channel videos fetched successfully");
});

export {
    getChannelStats,
    getChannelVideos,
}