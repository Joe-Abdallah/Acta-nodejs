const express = require("express");
const path = require("path");

const authRoutes = require("../src/routes/auth.routes");
const clientRoutes = require("../src/routes/client.routes");
const communityRoutes = require("../src/routes/community.routes");
const postRoutes = require("../src/routes/post.routes");
const commentRoutes = require("../src/routes/comment.routes");
const voteRoutes = require("../src/routes/vote.routes");
const viewRoutes = require("../src/routes/view.routes");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Global middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View routes
app.use("/", viewRoutes);

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/communities", communityRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/votes", voteRoutes);

module.exports = app;
