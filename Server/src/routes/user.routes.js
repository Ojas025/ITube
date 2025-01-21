import { Router } from 'express'
import { handleUserLogin, handleUserRegistration, handleUserLogout, handleRefreshAccessToken } from '../controllers/user.controllers.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js'
import { userRegistrationValidator, userLoginValidator } from '../validators/user.validator.js';
import { upload } from '../middlewares/multer.middleware.js';
import { checkAuthentication } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .route('/register')
    .post(
        userRegistrationValidator(),
        handleValidationErrors,
        upload.single("profileImage"),
        handleUserRegistration
    )

router
    .route('/login')
    .post(
        userLoginValidator(),
        handleValidationErrors,
        handleUserLogin
    )

router
    .route('/logout')
    .post(
        checkAuthentication,
        handleUserLogout
    )

router
    .route('/refresh-token')
    .post(
        handleRefreshAccessToken
    )

export default router