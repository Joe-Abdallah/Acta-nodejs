const { verifyToken } = require("../utils/token");

/**
 * @module authMiddleware
 *
 * Express middleware that protects routes by validating JWT tokens.
 * Reads the Bearer token from the Authorization header, verifies its
 * signature and expiry, and attaches the decoded payload to req.user
 * so downstream controllers can access the authenticated client's data.
 *
 * Usage:
 *   router.use(authenticate);              // protect all routes in a router
 *   router.get("/me", authenticate, handler); // protect a single route
 *
 * After this middleware runs successfully, controllers can access:
 *   req.user.sub      → the authenticated client's ID
 *   req.user.username → the authenticated client's username
 *   req.user.exp      → the token's expiry timestamp
 */

/**
 * Authenticates an incoming request by verifying its Bearer token.
 *
 * On success: attaches the decoded JWT payload to req.user and calls next()
 *   to pass control to the next middleware or route handler.
 *
 * On failure: responds immediately with 401 Unauthorized and does NOT call next(),
 *   blocking access to the protected route.
 *
 * @param {import('express').Request}      req  - Express request object.
 * @param {import('express').Response}     res  - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    // Ensure the Authorization header exists and follows "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    // Extract the token string after "Bearer "
    const token = authHeader.slice("Bearer ".length).trim();

    try {
        // Verify the token — throws if the signature is invalid or the token is expired
        req.user = verifyToken(token);
        next();
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
}

module.exports = { authenticate };