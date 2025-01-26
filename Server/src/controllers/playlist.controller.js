import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Playlist } from '../models/playlist.model.js'
import { Video } from '../models/video.model.js'

// Functionalities to be added:
// 1. createPlaylist --> ✅
// 2. getUserPlaylists (user._id) --> ✅
// 3. getPlaylistById (playlist._id) --> ✅
// 4. addVideoToPlaylist --> ✅
// 5. removeVideoFromPlaylist--> ✅
// 6. deletePlaylist --> ✅

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description){
        throw new ApiError(404, "Name and description is required");
    }

    const playlist = await Playlist.create({
        owner: req.user?._id,
        videos: [],
        name: name,
        description: description
    });

    if (!playlist){
        throw new ApiError(400, "Failed to create a playlist");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
}); 

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video){
        throw new ApiError(404, "Video not found");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId,
            }            
        },
        { new: true }
    );

    if (!updatedPlaylist){
        throw new ApiError(400, "Failed to add video to playlist");
    }

    return res
        .status(200)
        .json(200, updatedPlaylist, "Added Video to Playlist successfully");
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to delete this video");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId,
            }
        },

        { new: true }
    );

    if (!updatedPlaylist){
        throw new ApiError(400, "Error while updating playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Delete video from playlist successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },

        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            },
        },

        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },

                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },

        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                createdAt: 1,
                updatedAt: 1
            }
        },
    ]);

    return res
        .status(200)
        .json(200, userPlaylists, "Fetched user playlists successfully");
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },

        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },

        {
            $match: {
                "videos.isPublished": true,
            },
        },


        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },

        {
            $addFields: {
                totalVideos: {
                    $size: "$videos",
                },

                totalViews: { 
                    $sum: "$videos.views",
                },

                owner: {
                    $first: "$owner"
                }
            }
        },

        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                owner: {
                    username: 1,
                    _id: 1,
                    profileImageUrl: 1,
                },
                videos: {
                    "thumbnail.url": 1,
                    "videoFile.url": 1,
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    duration: 1,
                    views: 1
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(200, playlist[0], "Fethed playlist successfully");
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "You are not authorized to delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(200, {}, "Playlist deleted successfully");
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name && !description){
        throw new ApiError(404, "Both fields cannot be empty");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    // Only updating the playlist for now,
    // not returning the videos and owner data using aggregation 
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name? name : playlist.name,
                description: description? description : playlist.description
            },
        },
        { new: true }
    );

    if (!updatePlaylist){
        throw new ApiError(400, "Error while updating playlist");
    }

    return res
        .status(200)
        .json(200, updatedPlaylist, "Playlist updated successfully");
});


export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist
}