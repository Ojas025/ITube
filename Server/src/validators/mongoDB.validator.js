import { param } from "express-validator";

const mongoIdValidator = (id) => {
    return [
        param(id)
            .trim()
            .notEmpty()
            .withMessage("Empty mongo Id")
            .isMongoId()
            .withMessage("Invalid MongoId")
    ];
};

export {
    mongoIdValidator
}