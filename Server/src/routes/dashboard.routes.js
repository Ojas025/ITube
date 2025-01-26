import express from 'express'
import { checkAuthentication } from '../middlewares/auth.middleware';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller';

const router = express.Router();

router.use(checkAuthentication);

router
    .route("/stats")
    .get(getChannelStats)

router
    .route("/videos")
    .get(getChannelVideos)


export default router;