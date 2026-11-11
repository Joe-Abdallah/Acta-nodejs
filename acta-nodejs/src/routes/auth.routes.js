const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");

/**
 * @module authRoutes
 *
 * Auth routes — public endpoints, no authentication required.
 * Mounted at /api/v1/auth in app.js.
 *
 * POST /api/v1/auth/register → Register a new client account.
 *   Body: { username, email, password }
 *   Returns: 201 { token, client }
 *
 * POST /api/v1/auth/login → Login and receive a JWT token.
 *   Body: { email, password }
 *   Returns: 200 { token, client }
 */
const router = express.Router();

router.post("/register", registerValidator, AuthController.register);
router.post("/login",    loginValidator,    AuthController.login);

module.exports = router;