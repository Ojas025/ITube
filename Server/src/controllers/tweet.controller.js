import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Tweet } from '../models/tweet.model.js'
import { handleUpdateProfileImage } from './user.controller.js'

// Functionalities to be added:
// 1. createTweet
// 2. getAllUserTweets
// 3. getTweetById
// 4. deleteTweet
// 5. updateTweet 

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // if (!content) {
    //     throw new ApiError(404, "Tweet content is required");
    // }

    const tweet = await Tweet.create({
        owner: req.user?._id,
        content: content
    });

    if (!tweet) {
        throw new ApiError(400, "Error while posting tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet posted successfully"));     
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // if (!tweetId) {
    //     throw new ApiError(404, "tweetId is required");
    // }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if (req.user?._id.toString() !== tweet.owner.toString()){
        throw new ApiError(400, "You are not authorized to delete this tweet");
    }

    const deleteResponse = await Tweet.findByIdAndDelete(tweetId);

    if (!deleteResponse){
        throw new ApiError(400, "Error while deleting tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // if (!content){
    //     throw new ApiError(404, "Content is required");
    // }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if (req.user?._id.toString() !== tweet.owner.toString()){
        throw new ApiError(400, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        }
    );

    if (!updatedTweet){
        throw new ApiError(400, "Error while updating tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Updated Tweet successfully"));
});

const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },

        {
            $addFields: {
                likes: {
                    $size: "$likeDetails"
                },

                owner: {
                    $first: "$owner"
                }
            }
        },

        {
            $project: {
                content: 1,
                owner: 1,
                likes: 1,
                createdAt: 1
            }
        }
    ]);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Successfully fetched tweet by Id"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId }  = req.params;

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails"
            }
        },

        {
            $addFields: {
                likes: {
                    $size: "$likeDetails"
                },

                owner: {
                    $first: "$owner"
                }
            }
        },

        {
            $project: {
                content: 1,
                createdAt: 1,
                likes: 1,
                owner: 1
            }
        }
    ]);

    if (!userTweets?.length){
        throw new ApiError(404, "User Tweets not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "User Tweets fetched successfully"));
});

export {
    createTweet,
    deleteTweet,
    updateTweet,
    getTweetById,
    getUserTweets,
}