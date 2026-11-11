const express            = require("express");
const CommentController  = require("../controllers/comment.controller");
const { authenticate }   = require("../middleware/auth.middleware");
const { createCommentValidator, updateCommentValidator } = require("../validators/comment.validator");

/**
 * @module commentRoutes
 *
 * Comment routes — all routes require a valid JWT token.
 * Mounted at /api/v1/comments in app.js.
 *
 * GET    /api/v1/comments/post/:postId  → Get all comments on a post (oldest first).
 * GET    /api/v1/comments/:id/replies   → Get all direct replies to a comment.
 * GET    /api/v1/comments/:id           → Get a single comment by ID.
 * POST   /api/v1/comments               → Create a comment or reply.
 * PUT    /api/v1/comments/:id           → Update a comment's content (author only).
 * DELETE /api/v1/comments/:id           → Delete a comment and its replies (author only).
 *
 */
const router = express.Router();

// Apply authentication middleware to every route in this file
router.use(authenticate);

router.get("/post/:postId",            CommentController.getByPost);
router.get("/:id/replies",             CommentController.getReplies);
router.get("/:id",                     CommentController.getById);
router.post("/",  createCommentValidator, CommentController.create);
router.put("/:id", updateCommentValidator, CommentController.update);
router.delete("/:id",                  CommentController.deleteById);

module.exports = router;