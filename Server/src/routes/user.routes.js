import { Router } from 'express'
import { handleUserLogin, handleUserRegistration, handleUserLogout } from '../controllers/user.controllers.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js'
import { userLoginValidator, userRegistrationValidator } from '../validators/user.validator.js';
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

export default router