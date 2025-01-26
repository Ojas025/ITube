import express from 'express'
import mongoIdValidator from '../validators/mongoDB.validator.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js';
import { getAllChannelSubscribers, getAllSubscribedChannels, toggleSubscription } from '../controllers/subscription.controller.js';

const router = express.Router();

router
    .route("/c/:channelId")
    .get(mongoIdValidator(), handleValidationErrors, getAllChannelSubscribers)
    .patch(mongoIdValidator(), handleValidationErrors, toggleSubscription)

router
    .route("/u/:subscriberId")
    .get(mongoIdValidator(), handleValidationErrors, getAllSubscribedChannels)

export default router;