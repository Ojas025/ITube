import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos",
    }]
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);