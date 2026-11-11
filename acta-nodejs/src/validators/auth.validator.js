const { body } = require("express-validator");
const { validateRequest } = require("./index");
/**
 * Validates the request body for authorization.
 * Returns 400 with an errors array if validation fails.
 */
exports.registerValidator = [
    body("username").trim().notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 50 }).withMessage("Username must be 3–50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validateRequest,
];

exports.loginValidator = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
];
