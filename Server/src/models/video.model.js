import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel"
    },

    thumbnail: {
        type: String
    },

    title: {
        type: String,
        required: [true, "Video title is required"],
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    duration: {
        type: Number,
        required: true,
    },

    videoFile: {
        type: String,
        required: true
    },

    views: {
        type: Number
    },

    likes: {
        type: Number
    },

    isPublished: {
        type: Boolean
    },
}, { timestamps: true });

export const Video = mongoose.model("Video", videoSchema);