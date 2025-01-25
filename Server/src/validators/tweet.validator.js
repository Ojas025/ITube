import { body } from "express-validator";

const tweetValidator = () => {
    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("Content cannot be empty")
    ];
};

export {
    tweetValidator
}