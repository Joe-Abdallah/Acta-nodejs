const AuthService     = require("../services/auth.service");
const { handleError } = require("../utils/errorHandler");

/**
 * @class AuthController
 *
 * Handles HTTP requests for authentication endpoints.
 * Delegates all business logic to AuthService and maps
 * service results or errors to appropriate HTTP responses.
 */
class AuthController {
    /**
     * POST /api/v1/auth/register
     * Registers a new client account.
     *
     * @param {import('express').Request}  req - Express request. Body: { username, email, password }.
     * @param {import('express').Response} res - Express response. Returns 201 with token and client DTO on success.
     */
    static async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/auth/login
     * Logs in an existing client and returns a JWT token.
     *
     * @param {import('express').Request}  req - Express request. Body: { email, password }.
     * @param {import('express').Response} res - Express response. Returns 200 with token and client DTO on success.
     */
    static async login(req, res) {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = AuthController;