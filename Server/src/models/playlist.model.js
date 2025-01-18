import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos",
    }],

    videoCount: {
        type: Number,
    },
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);