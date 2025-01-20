import { ApiError } from "../utils/ApiError.js";
import { validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()){
        return next();
    }

    const formattedErrors = [];
    errors.array().map(err => formattedErrors.push({
        [err.path]: err.msg
    }));

    console.log(formattedErrors);
    throw new ApiError(422, "Data validation error", formattedErrors);
}

export { handleValidationErrors }