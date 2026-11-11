const PostRepository      = require("../repositories/post.repository");
const CommunityRepository = require("../repositories/community.repository");
const PostDto             = require("../dtos/post.dto");

/**
 * @class PostService
 *
 * Handles all business logic related to posts.
 * Enforces membership rules (must be a member to post),
 * ownership rules (only the author can update or delete),
 * and validates all required fields before delegating to the repository.
 */
class PostService {
    /**
     * Retrieves all posts across all communities, ordered by newest first.
     *
     * @returns {Promise<object[]>} Array of post response DTOs.
     */
    static async getAllPosts() {
        const entities = await PostRepository.findAll();
        return PostDto.toListDto(entities);
    }

    /**
     * Retrieves a single post by its ID.
     *
     * @param {number} id - The post's ID.
     * @returns {Promise<object>} The post response DTO.
     * @throws {Error} If the post does not exist.
     */
    static async getPostById(id) {
        const entity = await PostRepository.findById(id);
        if (!entity) throw new Error("Post not found");
        return PostDto.toResponseDto(entity);
    }

    /**
     * Retrieves all posts belonging to a specific community.
     *
     * @param {number} communityId - The community's ID.
     * @returns {Promise<object[]>} Array of post response DTOs.
     * @throws {Error} If the community does not exist.
     */
    static async getPostsByCommunity(communityId) {
        const community = await CommunityRepository.findById(communityId);
        if (!community) throw new Error("Community not found");

        const entities = await PostRepository.findByCommunity(communityId);
        return PostDto.toListDto(entities);
    }

    /**
     * Retrieves all posts authored by the authenticated client.
     *
     * @param {number} clientId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object[]>} Array of post response DTOs.
     */
    static async getPostsByAuthor(clientId) {
        const entities = await PostRepository.findByAuthor(clientId);
        return PostDto.toListDto(entities);
    }

    /**
     * Creates a new post in a community.
     * The authenticated client must be a member of the target community.
     *
     * @param {{ title: string, content?: string, communityId: number }} body - Post creation data.
     * @param {number} clientId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The newly created post response DTO.
     * @throws {Error} If title or communityId is missing, the community does not exist,
     *                 or the client is not a member of the community.
     */
    static async createPost(body, clientId) {
        if (!body.title)       throw new Error("Title is required");
        if (!body.communityId) throw new Error("communityId is required");

        const community = await CommunityRepository.findById(body.communityId);
        if (!community) throw new Error("Community not found");

        // Enforce membership — clients must join before they can post
        const isMember = await CommunityRepository.isMember(body.communityId, clientId);
        if (!isMember) throw new Error("You must join the community before posting");

        const data   = PostDto.fromCreateRequest(body);
        const entity = await PostRepository.create({ ...data, clientId });

        // Re-fetch to get the enriched version (with author username and community name)
        const enriched = await PostRepository.findById(entity.id);
        return PostDto.toResponseDto(enriched);
    }

    /**
     * Updates a post's title and/or content.
     * Only the post's author may update it.
     *
     * @param {number} id   - The post's ID.
     * @param {{ title: string, content?: string }} body - Updated fields.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The updated post response DTO.
     * @throws {Error} If the post is not found, the requester is not the author,
     *                 or the title is missing.
     */
    static async updatePost(id, body, requesterId) {
        const entity = await PostRepository.findById(id);
        if (!entity) throw new Error("Post not found");

        if (Number(entity.client_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the author of this post");
        }

        if (!body.title) throw new Error("Title is required");

        const data    = PostDto.fromUpdateRequest(body);
        const updated = await PostRepository.update(id, data);

        const enriched = await PostRepository.findById(updated.id);
        return PostDto.toResponseDto(enriched);
    }

    /**
     * Deletes a post by ID.
     * Only the post's author may delete it.
     * All comments and votes on the post are cascade-deleted by the database.
     *
     * @param {number} id          - The post's ID.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<void>}
     * @throws {Error} If the post is not found or the requester is not the author.
     */
    static async deletePost(id, requesterId) {
        const entity = await PostRepository.findById(id);
        if (!entity) throw new Error("Post not found");

        if (Number(entity.client_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the author of this post");
        }

        await PostRepository.deleteById(id);
    }
}

module.exports = PostService;