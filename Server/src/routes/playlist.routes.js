import express from 'express'
import { checkAuthentication } from '../middlewares/auth.middleware.js'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js';
import { mongoIdValidator } from '../validators/mongoDB.validator.js'
import { handleValidationErrors } from '../validators/handleValidationErrors.js'

const router = express.Router();
router.use(checkAuthentication);

router
    .route("/")
    .post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

router
    .route("/add/:playlistId/:videoId")
    .post(mongoIdValidator(), handleValidationErrors, addVideoToPlaylist)

router
    .route("/remove/:playlistId/:videoId")
    .patch(mongoIdValidator(), handleValidationErrors, removeVideoFromPlaylist)

router
    .route("/user/:userId")
    .get(mongoIdValidator(), handleValidationErrors, getUserPlaylists)

export default router;