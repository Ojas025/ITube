import mongoose from 'mongoose'

const tweetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default Tweet = mongoose.model("Tweet", tweetSchema); 