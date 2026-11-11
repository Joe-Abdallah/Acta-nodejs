const { body } = require("express-validator");
const { validateRequest } = require("./index");
/**
 * Validates the request body for comment.
 * Returns 400 with an errors array if validation fails.
 */
exports.createCommentValidator = [
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("postId").notEmpty().withMessage("postId is required")
        .isInt({ gt: 0 }).withMessage("postId must be a positive integer"),
    body("parentCommentId").optional({ nullable: true })
        .isInt({ gt: 0 }).withMessage("parentCommentId must be a positive integer"),
    validateRequest,
];

exports.updateCommentValidator = [
    body("content").trim().notEmpty().withMessage("Content is required"),
    validateRequest,
];
