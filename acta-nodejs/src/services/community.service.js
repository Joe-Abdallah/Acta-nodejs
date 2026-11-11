const CommunityRepository = require("../repositories/community.repository");
const CommunityDto        = require("../dtos/community.dto");

/**
 * @class CommunityService
 *
 * Handles all business logic related to communities.
 * Enforces ownership rules (only the creator can update or delete),
 * membership rules (must be a member to post, cannot leave as creator),
 * and uniqueness checks on community names.
 */
class CommunityService {
    /**
     * Retrieves all communities with creator info and member counts.
     *
     * @returns {Promise<object[]>} Array of community response DTOs.
     */
    static async getAllCommunities() {
        const entities = await CommunityRepository.findAll();
        return CommunityDto.toListDto(entities);
    }

    /**
     * Retrieves a single community by its ID.
     *
     * @param {number} id - The community's ID.
     * @returns {Promise<object>} The community response DTO.
     * @throws {Error} If the community does not exist.
     */
    static async getCommunityById(id) {
        const entity = await CommunityRepository.findById(id);
        if (!entity) throw new Error("Community not found");
        return CommunityDto.toResponseDto(entity);
    }

    /**
     * Creates a new community and automatically adds the creator as the first member.
     *
     * @param {{ name: string, description?: string }} body - Community creation data.
     * @param {number} creatorId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The newly created community response DTO.
     * @throws {Error} If the name is missing or already taken.
     */
    static async createCommunity(body, creatorId) {
        if (!body.name) throw new Error("Community name is required");

        const existing = await CommunityRepository.findByName(body.name);
        if (existing)  throw new Error("Community name already taken");

        const data   = CommunityDto.fromCreateRequest(body);
        const entity = await CommunityRepository.create({ ...data, creatorId });

        // Automatically join the creator as the first member
        await CommunityRepository.addMember(entity.id, creatorId);

        // Re-fetch to get the enriched version (with creator username and member count)
        const enriched = await CommunityRepository.findById(entity.id);
        return CommunityDto.toResponseDto(enriched);
    }

    /**
     * Updates a community's name and/or description.
     * Only the community's creator may update it.
     *
     * @param {number} id   - The community's ID.
     * @param {{ name: string, description?: string }} body - Updated fields.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The updated community response DTO.
     * @throws {Error} If the community is not found, the requester is not the creator,
     *                 or the name field is missing.
     */
    static async updateCommunity(id, body, requesterId) {
        const entity = await CommunityRepository.findById(id);
        if (!entity) throw new Error("Community not found");

        if (Number(entity.creator_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the creator of this community");
        }

        if (!body.name) throw new Error("Community name is required");

        const updated = await CommunityRepository.update(id, {
            name:        body.name,
            description: body.description ?? entity.description,
        });

        const enriched = await CommunityRepository.findById(updated.id);
        return CommunityDto.toResponseDto(enriched);
    }

    /**
     * Deletes a community by ID.
     * Only the community's creator may delete it.
     * All posts in the community and all memberships are cascade-deleted.
     *
     * @param {number} id          - The community's ID.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<void>}
     * @throws {Error} If the community is not found or the requester is not the creator.
     */
    static async deleteCommunity(id, requesterId) {
        const entity = await CommunityRepository.findById(id);
        if (!entity) throw new Error("Community not found");

        if (Number(entity.creator_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the creator of this community");
        }

        await CommunityRepository.deleteById(id);
    }

    /**
     * Adds the authenticated client as a member of a community.
     *
     * @param {number} communityId - The community's ID.
     * @param {number} clientId    - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<{ message: string }>} A success message.
     * @throws {Error} If the community is not found or the client is already a member.
     */
    static async joinCommunity(communityId, clientId) {
        const entity = await CommunityRepository.findById(communityId);
        if (!entity) throw new Error("Community not found");

        const isMember = await CommunityRepository.isMember(communityId, clientId);
        if (isMember) throw new Error("Already a member of this community");

        await CommunityRepository.addMember(communityId, clientId);
        return { message: `Joined community '${entity.name}'` };
    }

    /**
     * Removes the authenticated client from a community's membership.
     * The community's creator cannot leave their own community.
     *
     * @param {number} communityId - The community's ID.
     * @param {number} clientId    - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<{ message: string }>} A success message.
     * @throws {Error} If the community is not found, the client is not a member,
     *                 or the client is the creator.
     */
    static async leaveCommunity(communityId, clientId) {
        const entity = await CommunityRepository.findById(communityId);
        if (!entity) throw new Error("Community not found");

        const isMember = await CommunityRepository.isMember(communityId, clientId);
        if (!isMember) throw new Error("You are not a member of this community");

        if (Number(entity.creator_id) === Number(clientId)) {
            throw new Error("Forbidden: the creator cannot leave their own community");
        }

        await CommunityRepository.removeMember(communityId, clientId);
        return { message: `Left community '${entity.name}'` };
    }

    /**
     * Retrieves all communities that the authenticated client has joined.
     *
     * @param {number} clientId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object[]>} Array of community response DTOs.
     */
    static async getJoinedCommunities(clientId) {
        const entities = await CommunityRepository.findByMember(clientId);
        return CommunityDto.toListDto(entities);
    }
}

module.exports = CommunityService;