import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express(); 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import { checkAuthentication } from './middlewares/auth.middleware.js';
// app.use(checkAuthentication);

// Routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'

app.use("/api/users", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/likes", likeRouter);
app.use("/api/comments", commentRouter);

export { app }
