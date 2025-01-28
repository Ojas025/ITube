import express from 'express'
import { checkAuthentication } from '../middlewares/auth.middleware.js';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(checkAuthentication);

router
    .route("/stats")
    .get(getChannelStats)

router
    .route("/videos")
    .get(getChannelVideos)


export default router;