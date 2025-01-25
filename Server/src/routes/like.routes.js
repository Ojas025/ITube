import express from "express"
import { checkAuthentication } from '../middlewares/auth.middleware.js';
import { getCommentsLikedByUser, getTweetsLikedByUser, getVideosLikedByUser, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = express.Router();

router.use(checkAuthentication);

router
    .route("/video/:videoId")
    .patch(toggleVideoLike)

router
    .route("/comment/:commentId")
    .patch(toggleCommentLike)

router
    .route("/tweet/:tweetId")
    .patch(toggleTweetLike)

router 
    .route("/video")
    .get(getVideosLikedByUser)

router 
    .route("/comment")
    .get(getCommentsLikedByUser)

router 
    .route("/tweet")
    .get(getTweetsLikedByUser)

export default router;