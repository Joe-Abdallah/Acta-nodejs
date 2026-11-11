const CommunityService = require("../services/community.service");
const { handleError }  = require("../utils/errorHandler");

/**
 * @class CommunityController
 *
 * Handles HTTP requests for community endpoints.
 * Delegates all business logic to CommunityService and maps
 * service results or errors to appropriate HTTP responses.
 * The authenticated client's ID is read from req.user.sub,
 * which is set by the auth middleware after verifying the JWT.
 */
class CommunityController {
    /**
     * GET /api/v1/communities
     * Retrieves all communities with creator info and member counts.
     *
     * @param {import('express').Request}  req - Express request.
     * @param {import('express').Response} res - Express response. Returns 200 with array of community DTOs.
     */
    static async getAll(req, res) {
        try {
            const communities = await CommunityService.getAllCommunities();
            res.json(communities);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/communities/me
     * Retrieves all communities the authenticated client has joined.
     *
     * @param {import('express').Request}  req - Express request. User: req.user.sub.
     * @param {import('express').Response} res - Express response. Returns 200 with array of community DTOs.
     */
    static async getMyCommunities(req, res) {
        try {
            const communities = await CommunityService.getJoinedCommunities(req.user.sub);
            res.json(communities);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/communities/:id
     * Retrieves a single community by its ID.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with the community DTO, or 404 if not found.
     */
    static async getById(req, res) {
        try {
            const community = await CommunityService.getCommunityById(req.params.id);
            res.json(community);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/communities
     * Creates a new community. The authenticated client becomes the creator
     * and is automatically added as the first member.
     *
     * @param {import('express').Request}  req - Express request. Body: { name, description? }.
     * @param {import('express').Response} res - Express response. Returns 201 with the new community DTO.
     */
    static async create(req, res) {
        try {
            const community = await CommunityService.createCommunity(req.body, req.user.sub);
            res.status(201).json(community);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * PUT /api/v1/communities/:id
     * Updates a community's name and/or description.
     * Only the community's creator may update it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }. Body: { name, description? }.
     * @param {import('express').Response} res - Express response. Returns 200 with updated community DTO, or 403/404 on failure.
     */
    static async update(req, res) {
        try {
            const community = await CommunityService.updateCommunity(
                req.params.id,
                req.body,
                req.user.sub
            );
            res.json(community);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * DELETE /api/v1/communities/:id
     * Deletes a community and all its posts and memberships.
     * Only the community's creator may delete it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 403/404 on failure.
     */
    static async deleteById(req, res) {
        try {
            await CommunityService.deleteCommunity(req.params.id, req.user.sub);
            res.json({ message: "Community deleted" });
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/communities/:id/join
     * Adds the authenticated client as a member of the specified community.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 404/409 on failure.
     */
    static async join(req, res) {
        try {
            const result = await CommunityService.joinCommunity(req.params.id, req.user.sub);
            res.json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * DELETE /api/v1/communities/:id/leave
     * Removes the authenticated client from the community's membership.
     * The community creator cannot leave their own community.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 403/404 on failure.
     */
    static async leave(req, res) {
        try {
            const result = await CommunityService.leaveCommunity(req.params.id, req.user.sub);
            res.json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = CommunityController;