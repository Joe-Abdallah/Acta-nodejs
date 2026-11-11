const express          = require("express");
const PostController   = require("../controllers/post.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { createPostValidator, updatePostValidator } = require("../validators/post.validator");

/**
 * @module postRoutes
 *
 * Post routes — all routes require a valid JWT token.
 * Mounted at /api/v1/posts in app.js.
 *
 * GET    /api/v1/posts                        → Get all posts (newest first).
 * GET    /api/v1/posts/me                     → Get all posts by the authenticated client.
 * GET    /api/v1/posts/community/:communityId → Get all posts in a specific community.
 * GET    /api/v1/posts/:id                    → Get a single post by ID.
 * POST   /api/v1/posts                        → Create a new post (must be a community member).
 * PUT    /api/v1/posts/:id                    → Update a post (author only).
 * DELETE /api/v1/posts/:id                    → Delete a post (author only).
 */
const router = express.Router();

// Apply authentication middleware to every route in this file
router.use(authenticate);

router.get("/me",                       PostController.getMyPosts);
router.get("/community/:communityId",   PostController.getByCommunity);
router.get("/",                         PostController.getAll);
router.get("/:id",                      PostController.getById);
router.post("/",   createPostValidator, PostController.create);
router.put("/:id", updatePostValidator, PostController.update);
router.delete("/:id",                   PostController.deleteById);

module.exports = router;