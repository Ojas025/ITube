import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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

// Write a pre-hook to hash password
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch(error) {
        next(error);
    }    
});

// Write a custom method to compare passwords
userSchema.methods.isCorrectPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
}

// Generate Refresh Tokens
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}


export const User = mongoose.model("User", userSchema);