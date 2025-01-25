import express from 'express'
import { upload } from '../middlewares/multer.middleware.js';
import { checkAuthentication } from '../middlewares/auth.middleware.js';
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideoDetails } from '../controllers/video.controller.js';
import { mongoIdValidator } from '../validators/mongoDB.validator.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js';

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
    .get(mongoIdValidator(), handleValidationErrors, getVideoById)
    .patch(checkAuthentication, mongoIdValidator(), handleValidationErrors, upload.single("thumbnail"), updateVideoDetails)
    .delete(checkAuthentication, mongoIdValidator(), handleValidationErrors, deleteVideo)

router
    .route("/toggle/publish/:videoId")
    .patch(mongoIdValidator(), handleValidationErrors, togglePublishStatus)

export default router;