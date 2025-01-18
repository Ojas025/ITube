import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    name: {
        type: String,
        required: [true, "Channel name is required"]
    },

    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],

    subscriberCount: {
        type: Number
    }
}, { timestamps: true });

export default Channel = mongoose.model("Channel", channelSchema);