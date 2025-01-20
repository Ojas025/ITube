import { ApiError } from "../utils/ApiError";
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

    throw new ApiError(422, "Data validation error", formattedErrors);
}

export default handleValidationErrors