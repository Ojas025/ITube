import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    content: {
        type: String,
        required: [true, "Cannot post an empty comment"],
        trim: true,
    },

    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },

    likesCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);