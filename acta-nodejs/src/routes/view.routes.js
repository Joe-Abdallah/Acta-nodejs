const express = require("express");
const ViewController = require("../controllers/view.controller");

/**
 * @module viewRoutes
 *
 * EJS view routes
 * Mounted at / in app.js.
 */
const router = express.Router();

// Dashboard
router.get("/", ViewController.renderHome);

// Clients
router.get("/clients", ViewController.renderClients);
router.post("/clients", ViewController.createClient);

// Communities
router.get("/communities", ViewController.renderCommunities);
router.post("/communities", ViewController.createCommunity);
router.post("/communities/:id/join", ViewController.joinCommunity);

// Posts
router.get("/posts", ViewController.renderPosts);
router.post("/posts", ViewController.createPost);
router.post("/posts/:id/upvote", ViewController.upvotePost);
router.post("/posts/:id/downvote", ViewController.downvotePost);

// Comments
router.get("/posts/:postId/comments", ViewController.renderComments);
router.post("/posts/:postId/comments", ViewController.createComment);
router.post("/comments/:id/upvote", ViewController.upvoteComment);
router.post("/comments/:id/downvote", ViewController.downvoteComment);

module.exports = router;
