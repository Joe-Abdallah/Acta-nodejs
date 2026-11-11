const { body } = require("express-validator");
const { validateRequest } = require("./index");
/**
 * Validates the request body for post.
 * Returns 400 with an errors array if validation fails.
 */
exports.createPostValidator = [
    body("title").trim().notEmpty().withMessage("Title is required")
        .isLength({ max: 300 }).withMessage("Title must be at most 300 characters"),
    body("content").optional().isString(),
    body("communityId").notEmpty().withMessage("communityId is required")
        .isInt({ gt: 0 }).withMessage("communityId must be a positive integer"),
    validateRequest,
];

exports.updatePostValidator = [
    body("title").trim().notEmpty().withMessage("Title is required")
        .isLength({ max: 300 }).withMessage("Title must be at most 300 characters"),
    body("content").optional().isString(),
    validateRequest,
];
