import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true,
        index: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        lowercase: true
    },

    profileImage: {
        type: String,
    },

    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],

    refreshToken: {
        type: String,
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);