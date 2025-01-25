import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToCloudinary } from '../services/cloudinary.js'
import { Like } from '../models/like.model.js'

// Functionalities to be added:
// 1. toggleVideoLike --> ✅
// 2. toggleCommentLike --> ✅
// 3. toggleTweetLike --> ✅
// 4. getVideosLikedByUser --> ✅
// 5. getLikedComments --> ✅
// 6. getLikedTweets --> ✅

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const like = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    });

    if (like) {
        await Like.findByIdAndDelete(like?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, "Unliked the video successfully"));
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    });

    return res
        .status(200, "Liked the video successfully");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const like = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if (like){
        await Like.findByIdAndDelete(like?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, "Unliked the comment successfully"));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Liked the comment successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    if (like){
        await Like.findByIdAndDelete(like?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, "Unliked the Tweet successfully"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Liked the Tweet successfully"));
})

const getVideosLikedByUser = asyncHandler(async (req, res) => {
    const videosLikedByUser = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },

                    {
                        $unwind: "$owner"
                    }
                ]
            }
        },

        {
            $unwind: "$likedVideo"
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $project: {
                likedVideo: {
                    _id: 1,
                    title: 1,
                    "thumbnail.url": 1,
                    "videoFile.url": 1,
                    isPublished: 1,
                    owner: {
                        username: 1,
                        profileImageUrl: 1
                    },
                    duration: 1,
                    createdAt: 1,
                    views: 1,
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, videosLikedByUser, "Fetched all the videos liked by the user"));
});

const getCommentsLikedByUser = asyncHandler(async (req, res) => {
    const commentsLikedByUser = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "likedComment",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },

                    {
                        $unwind: "$owner"
                    }
                ]
            }
        },

        {
            $unwind: "$likedComment"
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $project: {
                likedComment: {
                    _id: 1,
                    content: 1,
                    owner: {
                        username: 1,
                        profileImageUrl: 1
                    },
                    createdAt: 1,
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, commentsLikedByUser, "Fetched all the Comments liked by the user"));
});

const getTweetsLikedByUser = asyncHandler(async (req, res) => {
    const tweetsLikedByUser = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },

        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "likedTweet",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },

                    {
                        $unwind: "$owner"
                    }
                ]
            }
        },

        {
            $unwind: "$likedTweet"
        },

        {
            $sort: {
                createdAt: -1
            }
        },

        {
            $project: {
                likedTweet: {
                    _id: 1,
                    content: 1,
                    owner: {
                        username: 1,
                        profileImageUrl: 1
                    },
                    createdAt: 1,
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweetsLikedByUser, "Fetched all the Tweets liked by the user"));
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getVideosLikedByUser,
    getCommentsLikedByUser,
    getTweetsLikedByUser,
}