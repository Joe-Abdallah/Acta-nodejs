const express             = require("express");
const CommunityController = require("../controllers/community.controller");
const { authenticate }    = require("../middleware/auth.middleware");
const { createCommunityValidator } = require("../validators/community.validator");

/**
 * @module communityRoutes
 *
 * Community routes — all routes require a valid JWT token.
 * Mounted at /api/v1/communities in app.js.
 *
 * GET    /api/v1/communities            → Get all communities.
 * GET    /api/v1/communities/me         → Get communities the client has joined.
 * GET    /api/v1/communities/:id        → Get a single community by ID.
 * POST   /api/v1/communities            → Create a new community.
 * PUT    /api/v1/communities/:id        → Update a community (creator only).
 * DELETE /api/v1/communities/:id        → Delete a community (creator only).
 * POST   /api/v1/communities/:id/join   → Join a community.
 * DELETE /api/v1/communities/:id/leave  → Leave a community.
 */
const router = express.Router();

// Apply authentication middleware to every route in this file
router.use(authenticate);

router.get("/me",           CommunityController.getMyCommunities);
router.get("/",             CommunityController.getAll);
router.get("/:id",          CommunityController.getById);
router.post("/",            createCommunityValidator, CommunityController.create);
router.put("/:id",          createCommunityValidator, CommunityController.update);
router.delete("/:id",       CommunityController.deleteById);
router.post("/:id/join",    CommunityController.join);
router.delete("/:id/leave", CommunityController.leave);

module.exports = router;