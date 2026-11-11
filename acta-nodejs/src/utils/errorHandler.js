/**
 * @module errorHandler
 *
 * Shared error handling utility for all controllers.
 * Maps known error message keywords to appropriate HTTP status codes,
 * so every controller delegates error responses here instead of
 * duplicating status-code logic across files.
 *
 * Mapping rules (checked in order):
 * - message includes "not found"             → 404 Not Found
 * - message includes "required"              → 400 Bad Request
 * - message includes "invalid"              → 401 Unauthorized
 * - message includes "already"              → 409 Conflict
 * - message includes "forbidden" or "not the" → 403 Forbidden
 * - anything else                           → 500 Internal Server Error
 */

/**
 * Sends an appropriate HTTP error response based on the error's message text.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {Error} err                      - The error thrown by the service layer.
 * @returns {import('express').Response}   - The Express response with JSON error body.
 */
function handleError(res, err) {
    if (err.message?.toLowerCase().includes("not found")) {
        return res.status(404).json({ error: err.message });
    }
    if (err.message?.includes("required")) {
        return res.status(400).json({ error: err.message });
    }
    if (err.message?.toLowerCase().includes("invalid")) {
        return res.status(401).json({ error: err.message });
    }
    if (err.message?.toLowerCase().includes("already")) {
        return res.status(409).json({ error: err.message });
    }
    if (
        err.message?.toLowerCase().includes("forbidden") ||
        err.message?.toLowerCase().includes("not the")
    ) {
        return res.status(403).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
}

module.exports = { handleError };