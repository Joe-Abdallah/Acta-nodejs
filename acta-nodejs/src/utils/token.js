const jwt = require("jsonwebtoken");

/** Default token lifetime: 1 hour in seconds. */
const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;

/**
 * @module token
 *
 * JWT utility functions for generating and verifying authentication tokens.
 * Tokens are signed with HMAC-SHA256 using a secret loaded from environment variables.
 *
 * All jsonwebtoken-specific error types (TokenExpiredError, JsonWebTokenError)
 * are normalized to plain Error instances so the auth middleware always
 * receives a consistent error shape regardless of the failure reason.
 */

/**
 * Reads the JWT signing secret from the AUTH_SECRET environment variable.
 * Falls back to a hardcoded development value if not set.
 *
 * @returns {string} The signing secret.
 */
function getSecret() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error("AUTH_SECRET is not set. Add it to your .env file.");
    }
    return secret;
}

/**
 * Reads the token TTL (time-to-live) from the AUTH_TOKEN_TTL_SECONDS environment variable.
 * Falls back to 3600 seconds (1 hour) if the value is missing or not a valid number.
 *
 * @returns {number} Token lifetime in seconds.
 */
function getExpiresInSeconds() {
    const parsed = Number(process.env.AUTH_TOKEN_TTL_SECONDS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TOKEN_TTL_SECONDS;
}

/**
 * Generates a signed JWT token containing the provided payload.
 * The token is signed with HS256. The exp (expiry) claim is added automatically.
 *
 * Typical payload: { sub: <clientId>, username: <username> }
 *
 * @param {object} payload           - Data to encode in the token.
 * @param {number} payload.sub       - The authenticated client's ID (subject claim).
 * @param {string} payload.username  - The authenticated client's username.
 * @param {object} [options={}]      - Optional overrides forwarded to jwt.sign().
 * @returns {string} The signed JWT token string.
 */
function generateToken(payload, options = {}) {
    return jwt.sign(payload, getSecret(), {
        algorithm: "HS256",
        expiresIn: getExpiresInSeconds(),
        ...options,
    });
}

/**
 * Verifies a JWT token and returns its decoded payload.
 *
 * @param {string} token         - The JWT token string to verify.
 * @param {object} [options={}]  - Optional overrides forwarded to jwt.verify().
 * @returns {{ sub: number, username: string, exp: number, iat: number }} The decoded payload.
 * @throws {Error} "jwt expired"         — if the token's expiry time has passed.
 * @throws {Error} "invalid signature"   — if the token was tampered with.
 */
function verifyToken(token, options = {}) {
    try {
        return jwt.verify(token, getSecret(), {
            algorithms: ["HS256"],
            ...options,
        });
    } catch (err) {
        // Normalize jsonwebtoken error types into plain Error instances
        // to keep auth middleware error handling simple and consistent.
        if (err && (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")) {
            throw new Error(err.message);
        }
        throw err;
    }
}

module.exports = { generateToken, verifyToken };