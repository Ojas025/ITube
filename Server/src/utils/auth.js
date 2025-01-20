import jwt from 'jsonwebtoken'

const validateToken = (token, secretKey) => {
    return jwt.verify(token, secretKey);
}

export {
    validateToken
}