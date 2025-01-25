import express from 'express'
import { upload } from '../middlewares/multer.middleware.js';
import { checkAuthentication } from '../middlewares/auth.middleware.js';
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideoDetails } from '../controllers/video.controller.js';

const router = express.Router();

router
    .route("/")
    .get(getAllVideos)

router
    .route("/publish")
    .post(
        checkAuthentication,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },

            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishVideo
    )

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(checkAuthentication, upload.single("thumbnail"), updateVideoDetails)
    .delete(checkAuthentication, deleteVideo)

router
    .route("/toggle/publish/:videoId")
    .patch(togglePublishStatus)

export default router;