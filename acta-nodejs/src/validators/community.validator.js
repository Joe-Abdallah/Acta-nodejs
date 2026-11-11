const { body } = require("express-validator");
const { validateRequest } = require("./index");
/**
 * Validates the request body for community.
 * Returns 400 with an errors array if validation fails.
 */
exports.createCommunityValidator = [
    body("name").trim().notEmpty().withMessage("Community name is required")
        .isLength({ min: 3, max: 100 }).withMessage("Name must be 3–100 characters"),
    body("description").optional().isString(),
    validateRequest,
];
