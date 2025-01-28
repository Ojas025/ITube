import express from 'express'
import { handleValidationErrors } from '../validators/handleValidationErrors.js';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';
import { mongoIdValidator } from '../validators/mongoDB.validator.js';
import { tweetValidator } from '../validators/tweet.validator.js';

const router = express.Router();

router
    .route("/")
    .post(
        tweetValidator(),
        handleValidationErrors,
        createTweet
    )

router
    .route("/user/:userId")
    .get(
        mongoIdValidator(),
        handleValidationErrors,
        getUserTweets
    )

router
    .route("/:tweetId")
    .delete(
        mongoIdValidator(),
        handleValidationErrors,
        deleteTweet
    )
    .patch(
        mongoIdValidator(),
        handleValidationErrors,
        updateTweet
    )

export default router;