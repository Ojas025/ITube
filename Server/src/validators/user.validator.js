import { body } from 'express-validator'

const userRegistrationValidator = () => {
    return [
        body('username')
            .trim()
            .notEmpty()
            .withMessage("Username is required"),
        body('email')
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid Email"),
        body('password')
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be atleast 8 characters long")
    ];
};

const userLoginValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid Email"),
        
        body('password')
            .trim()
            .notEmpty()
            .withMessage("Password is required")
    ];
};

export {
    userRegistrationValidator,
    userLoginValidator
}