import { Router } from 'express'
import { 
        handleUserLogin,
        handleUserRegistration,
        handleUserLogout,
        handleRefreshAccessToken,
        handleChangeUserPassword,
        getCurrentUser,
        handleUpdateAccountDetails,
        handleUpdateProfileImage,
        handleGetChannelData,
        handleGetUserWatchHistory
    } from '../controllers/user.controllers.js';
import { handleValidationErrors } from '../validators/handleValidationErrors.js'
import { userRegistrationValidator, userLoginValidator } from '../validators/user.validator.js';
import { upload } from '../middlewares/multer.middleware.js';
import { checkAuthentication } from '../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';

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

router
    .route('/change-password')
    .post(
        checkAuthentication,
        handleChangeUserPassword
    )

router
    .route('/get-user')
    .get(
        getCurrentUser
    )

router
    .route('/update-account-details')
    .patch(
        checkAuthentication,
        handleUpdateAccountDetails
    )

router
    .route('/update-profile-image')
    .patch(
        checkAuthentication,
        upload.single("profileImage"),
        handleUpdateProfileImage
    )

router
    .route('/c/:username')
    .get(
        param("username").trim().notEmpty().withMessage("Username required"),
        handleValidationErrors,
        checkAuthentication,
        handleGetChannelData
    )

router
    .route('/watch-history')
    .get(
        checkAuthentication,
        handleGetUserWatchHistory
    )

export default router