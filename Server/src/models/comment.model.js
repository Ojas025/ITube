import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

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
    }
}, { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);