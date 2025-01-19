import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

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
        type: Number,
        default: 0,
    },

    likes: {
        type: Number,
        default: 0,
    },

    isPublished: {
        type: Boolean
    },
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);