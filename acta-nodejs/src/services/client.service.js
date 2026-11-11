const ClientRepository = require("../repositories/client.repository");
const ClientDto        = require("../dtos/client.dto");

/**
 * @class ClientService
 *
 * Handles all business logic related to client accounts.
 */
class ClientService {
    /**
     * Retrieves all registered clients.
     *
     * @returns {Promise<object[]>} Array of client response DTOs.
     */
    static async getAllClients() {
        const entities = await ClientRepository.findAll();
        return ClientDto.toListDto(entities);
    }

    /**
     * Retrieves a single client by their ID.
     *
     * @param {number} id - The client's ID.
     * @returns {Promise<object>} The client response DTO.
     * @throws {Error} If the client does not exist.
     */
    static async getClientById(id) {
        const entity = await ClientRepository.findById(id);
        if (!entity) throw new Error("Client not found");
        return ClientDto.toResponseDto(entity);
    }

    /**
     * Updates a client's username and/or email.
     * Only the account owner (the currently logged-in client) may update their account.
     *
     * @param {number} id          - The ID of the client to update.
     * @param {{ username?: string, email?: string }} body - Fields to update.
     * @param {number} requesterId - The ID of the authenticated client (from req.user.sub).
     * @returns {Promise<object>} The updated client response DTO.
     * @throws {Error} If the client is not found, the requester is not the owner,
     *                 or no valid fields are provided.
     */
    static async updateClient(id, body, requesterId) {
        if (Number(id) !== Number(requesterId)) {
            throw new Error("Forbidden: you can only update your own account");
        }

        const entity = await ClientRepository.findById(id);
        if (!entity) throw new Error("Client not found");

        if (!body.username && !body.email) {
            throw new Error("At least one field (username or email) is required");
        }

        const updated = await ClientRepository.update(id, {
            // Fall back to the existing value if a field is not provided
            username: body.username ?? entity.username,
            email:    body.email    ?? entity.email,
        });
        return ClientDto.toResponseDto(updated);
    }

    /**
     * Deletes a client account by ID.
     * Only the account owner may delete their own account.
     * All related posts, comments, votes, and owned communities are cascade-deleted.
     *
     * @param {number} id          - The ID of the client to delete.
     * @param {number} requesterId - The ID of the authenticated client (from req.user.sub).
     * @returns {Promise<void>}
     * @throws {Error} If the client is not found or the requester is not the owner.
     */
    static async deleteClient(id, requesterId) {
        if (!id) throw new Error("ID is required");

        const entity = await ClientRepository.findById(id);
        if (!entity) throw new Error("Client not found");

        if (Number(entity.id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the owner of this account");
        }

        await ClientRepository.deleteById(id);
    }
}

module.exports = ClientService;