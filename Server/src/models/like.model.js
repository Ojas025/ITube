import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema({
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        default: null
    },
}, { timestamps: true });

export const Like = mongoose.model("Like", likeSchema);