import { Router } from 'express'
import { handleUserRegistration } from '../controllers/user.controllers.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js'
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router
    .route('/register')
    .post(
        userRegistrationValidator(),
        handleValidationErrors,
        upload.single("profileImage"),
        handleUserRegistration
    )

export default router;