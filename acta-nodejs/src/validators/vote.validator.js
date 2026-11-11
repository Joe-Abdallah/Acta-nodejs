const { body } = require("express-validator");
const { validateRequest } = require("./index");
/**
 * Validates the request body for vote.
 * Returns 400 with an errors array if validation fails.
 */
exports.voteValidator = [
    body("voteType")
        .notEmpty().withMessage("voteType is required")
        .isIn(["UPVOTE", "DOWNVOTE"]).withMessage("voteType must be UPVOTE or DOWNVOTE"),
    validateRequest,
];
