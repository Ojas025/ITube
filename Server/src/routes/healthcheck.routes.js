import express from 'express'
import { healthCheck } from '../controllers/healthcheck.controller.js';

const router = express.Router();

router
    .route("/")
    .get(healthCheck)

export default router;