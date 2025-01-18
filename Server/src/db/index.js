import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        )

        console.log("MongoDB connected!");
        console.log(connectionInstance);
    } catch (error) {
        console.error("MONGODB Connection Error", error);
    }
}

export default connectDB;