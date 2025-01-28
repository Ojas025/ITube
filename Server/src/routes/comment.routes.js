import express from "express"
import { checkAuthentication } from "../middlewares/auth.middleware.js"
import { deleteComment, getUserComments, getVideoComments, postComment, updateComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.use(checkAuthentication);

router
    .route("/video/:videoId")
    .get(getVideoComments)

router
    .route("/user")
    .get(getUserComments)
    .post(postComment)

router
    .route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router;