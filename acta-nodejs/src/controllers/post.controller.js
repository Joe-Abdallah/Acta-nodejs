const PostService     = require("../services/post.service");
const { handleError } = require("../utils/errorHandler");

/**
 * @class PostController
 *
 * Handles HTTP requests for post endpoints.
 * Delegates all business logic to PostService and maps
 * service results or errors to appropriate HTTP responses.
 * The authenticated client's ID is read from req.user.sub,
 * which is set by the auth middleware after verifying the JWT.
 */
class PostController {
    /**
     * GET /api/v1/posts
     * Retrieves all posts across all communities, ordered by newest first.
     *
     * @param {import('express').Request}  req - Express request.
     * @param {import('express').Response} res - Express response. Returns 200 with array of post DTOs.
     */
    static async getAll(req, res) {
        try {
            const posts = await PostService.getAllPosts();
            res.json(posts);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/posts/me
     * Retrieves all posts authored by the authenticated client.
     *
     * @param {import('express').Request}  req - Express request. User: req.user.sub.
     * @param {import('express').Response} res - Express response. Returns 200 with array of post DTOs.
     */
    static async getMyPosts(req, res) {
        try {
            const posts = await PostService.getPostsByAuthor(req.user.sub);
            res.json(posts);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/posts/:id
     * Retrieves a single post by its ID.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with the post DTO, or 404 if not found.
     */
    static async getById(req, res) {
        try {
            const post = await PostService.getPostById(req.params.id);
            res.json(post);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/posts/community/:communityId
     * Retrieves all posts belonging to a specific community.
     *
     * @param {import('express').Request}  req - Express request. Params: { communityId }.
     * @param {import('express').Response} res - Express response. Returns 200 with array of post DTOs, or 404 if community not found.
     */
    static async getByCommunity(req, res) {
        try {
            const posts = await PostService.getPostsByCommunity(req.params.communityId);
            res.json(posts);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/posts
     * Creates a new post in a community.
     * The authenticated client must be a member of the target community.
     *
     * @param {import('express').Request}  req - Express request. Body: { title, content?, communityId }.
     * @param {import('express').Response} res - Express response. Returns 201 with the new post DTO.
     */
    static async create(req, res) {
        try {
            const post = await PostService.createPost(req.body, req.user.sub);
            res.status(201).json(post);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * PUT /api/v1/posts/:id
     * Updates a post's title and/or content.
     * Only the post's author may update it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }. Body: { title, content? }.
     * @param {import('express').Response} res - Express response. Returns 200 with updated post DTO, or 403/404 on failure.
     */
    static async update(req, res) {
        try {
            const post = await PostService.updatePost(req.params.id, req.body, req.user.sub);
            res.json(post);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * DELETE /api/v1/posts/:id
     * Deletes a post and all its comments and votes.
     * Only the post's author may delete it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 403/404 on failure.
     */
    static async deleteById(req, res) {
        try {
            await PostService.deletePost(req.params.id, req.user.sub);
            res.json({ message: "Post deleted" });
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = PostController;