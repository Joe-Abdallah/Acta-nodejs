const express           = require("express");
const VoteController    = require("../controllers/vote.controller");
const { authenticate }  = require("../middleware/auth.middleware");
const { voteValidator } = require("../validators/vote.validator");

/**
 * @module voteRoutes
 *
 * Vote routes — all routes require a valid JWT token.
 * Mounted at /api/v1/votes in app.js.
 *
 * POST /api/v1/votes/posts/:postId       → Vote on a post.
 * POST /api/v1/votes/comments/:commentId → Vote on a comment.
 *
 * Both endpoints accept { voteType: "UPVOTE" | "DOWNVOTE" } in the request body.
 * Sending the same voteType twice removes the vote (toggle off).
 * Sending the opposite voteType switches the vote direction.
 */
const router = express.Router();

// Apply authentication middleware to every route in this file
router.use(authenticate);

router.post("/posts/:postId",       voteValidator, VoteController.voteOnPost);
router.post("/comments/:commentId", voteValidator, VoteController.voteOnComment);

module.exports = router;