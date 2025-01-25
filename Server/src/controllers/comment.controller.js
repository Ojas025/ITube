import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Comment } from '../models/comment.model.js' 
import { Video } from '../models/video.model.js'

// Functionalities to be added:
// 1. getVideoComments --> ✅
// 2. postComment --> ✅
// 3. deleteComment --> ✅
// 4. updateComment --> ✅
// 5. getUserComments --> ✅

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },

        {
            $unwind: "$owner"
        },

        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    if (!comments?.length){
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No comments found for this video"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Fetched Video Comments successfully"));
});

const postComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);   
    
    if (!video){
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        owner: req.user?._id,
        video: videoId,
        content: content
    });

    if (!comment){
        throw new ApiError(400, "Error while posting comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment posted successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment){
        throw new ApiError(404, "Comment not found");
    }

    if (req.user?._id.toString() !== comment.owner.toString()){
        throw new ApiError(400, "You are not authorized to delete this comment");
    }

    const deleteRespoonse = await Comment.findByIdAndDelete(commentId);

    if (!deleteRespoonse){
        throw new ApiError(400, "Error while deleting comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(404, "Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!commentId) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content
        },
        { new: true }
    );

    if (!updatedComment){
        throw new ApiError(400, "Error in updating comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Updated comment successfully"));
});

const getUserComments = asyncHandler(async (req, res) => {
    const userComments = await Comment.find({
        owner: req.user?._id
    });

    if (!userComments?.length){
        throw new ApiError(404, "User comments not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userComments, "Fetched user comments successfully"));
});

export {
    getVideoComments,
    postComment,
    updateComment,
    deleteComment,
    getUserComments
}