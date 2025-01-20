import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 7000, () => console.log(`Server started at PORT:${process.env.PORT}`))
    })
    .catch((e) => {
        console.error("MongoDB Connection Failed!", e);
    });