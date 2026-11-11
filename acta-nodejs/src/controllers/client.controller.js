const ClientService   = require("../services/client.service");
const { handleError } = require("../utils/errorHandler");

/**
 * @class ClientController
 *
 * Handles HTTP requests for client (user) endpoints.
 * Delegates all business logic to ClientService and maps
 * service results or errors to appropriate HTTP responses.
 * The authenticated client's ID is read from req.user.sub,
 * which is set by the auth middleware after verifying the JWT.
 */
class ClientController {
    /**
     * GET /api/v1/clients
     * Retrieves all registered clients.
     *
     * @param {import('express').Request}  req - Express request.
     * @param {import('express').Response} res - Express response. Returns 200 with array of client DTOs.
     */
    static async getAll(req, res) {
        try {
            const clients = await ClientService.getAllClients();
            res.json(clients);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/clients/:id
     * Retrieves a single client by their ID.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with the client DTO, or 404 if not found.
     */
    static async getById(req, res) {
        try {
            const client = await ClientService.getClientById(req.params.id);
            res.json(client);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * PUT /api/v1/clients/:id
     * Updates the authenticated client's own account (username and/or email).
     * Only the account owner can update their own account.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }. Body: { username?, email? }.
     * @param {import('express').Response} res - Express response. Returns 200 with updated client DTO, or 403/404 on failure.
     */
    static async update(req, res) {
        try {
            const client = await ClientService.updateClient(req.params.id, req.body, req.user.sub);
            res.json(client);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * DELETE /api/v1/clients/:id
     * Deletes the authenticated client's own account.
     * Only the account owner can delete their own account.
     * All related posts, comments, votes, and owned communities are cascade-deleted.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 403/404 on failure.
     */
    static async deleteById(req, res) {
        try {
            await ClientService.deleteClient(req.params.id, req.user.sub);
            res.json({ message: "Account deleted" });
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = ClientController;