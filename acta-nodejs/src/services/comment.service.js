const CommentRepository = require("../repositories/comment.repository");
const PostRepository    = require("../repositories/post.repository");
const CommentDto        = require("../dtos/comment.dto");

/**
 * @class CommentService
 *
 * Handles all business logic related to comments and replies.
 * Enforces authorship rules (only the author can update or delete),
 * validates parent-child relationships for nested replies,
 * and keeps the post's cached comment_count in sync.
 */
class CommentService {
    /**
     * Retrieves all comments for a given post, ordered by oldest first.
     * Includes both top-level comments and replies.
     *
     * @param {number} postId - The post's ID.
     * @returns {Promise<object[]>} Array of comment response DTOs.
     * @throws {Error} If the post does not exist.
     */
    static async getCommentsByPost(postId) {
        const post = await PostRepository.findById(postId);
        if (!post) throw new Error("Post not found");

        const entities = await CommentRepository.findByPost(postId);
        return CommentDto.toListDto(entities);
    }

    /**
     * Retrieves all direct replies to a given comment.
     *
     * @param {number} parentCommentId - The parent comment's ID.
     * @returns {Promise<object[]>} Array of comment response DTOs.
     * @throws {Error} If the parent comment does not exist.
     */
    static async getReplies(parentCommentId) {
        const parent = await CommentRepository.findById(parentCommentId);
        if (!parent) throw new Error("Comment not found");

        const entities = await CommentRepository.findReplies(parentCommentId);
        return CommentDto.toListDto(entities);
    }

    /**
     * Retrieves a single comment by its ID.
     *
     * @param {number} id - The comment's ID.
     * @returns {Promise<object>} The comment response DTO.
     * @throws {Error} If the comment does not exist.
     */
    static async getCommentById(id) {
        const entity = await CommentRepository.findById(id);
        if (!entity) throw new Error("Comment not found");
        return CommentDto.toResponseDto(entity);
    }

    /**
     * Creates a new comment or reply on a post.
     * If parentCommentId is provided, the comment is a reply to that comment.
     * Also increments the post's cached comment_count by 1.
     *
     * @param {{ content: string, postId: number, parentCommentId?: number }} body - Comment data.
     * @param {number} clientId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The newly created comment response DTO.
     * @throws {Error} If content or postId is missing, the post does not exist,
     *                 the parent comment does not exist, or the parent comment
     *                 does not belong to the specified post.
     */
    static async createComment(body, clientId) {
        if (!body.content) throw new Error("Content is required");
        if (!body.postId)  throw new Error("postId is required");

        const post = await PostRepository.findById(body.postId);
        if (!post) throw new Error("Post not found");

        // Validate the parent comment if this is a reply
        if (body.parentCommentId) {
            const parent = await CommentRepository.findById(body.parentCommentId);
            if (!parent) throw new Error("Parent comment not found");

            // Ensure the parent comment belongs to the same post
            if (Number(parent.post_id) !== Number(body.postId)) {
                throw new Error("Parent comment does not belong to the specified post");
            }
        }

        const data   = CommentDto.fromCreateRequest(body);
        const entity = await CommentRepository.create({ ...data, clientId });

        // Keep the post's comment count in sync
        await PostRepository.adjustCommentCount(body.postId, 1);

        // Re-fetch to get the enriched version (with author username)
        const enriched = await CommentRepository.findById(entity.id);
        return CommentDto.toResponseDto(enriched);
    }

    /**
     * Updates a comment's content.
     * Only the comment's author may update it.
     *
     * @param {number} id   - The comment's ID.
     * @param {{ content: string }} body - Updated content.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<object>} The updated comment response DTO.
     * @throws {Error} If content is missing, the comment is not found,
     *                 or the requester is not the author.
     */
    static async updateComment(id, body, requesterId) {
        if (!body.content) throw new Error("Content is required");

        const entity = await CommentRepository.findById(id);
        if (!entity) throw new Error("Comment not found");

        if (Number(entity.client_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the author of this comment");
        }

        const updated  = await CommentRepository.update(id, { content: body.content });
        const enriched = await CommentRepository.findById(updated.id);
        return CommentDto.toResponseDto(enriched);
    }

    /**
     * Deletes a comment by ID and decrements the post's cached comment_count.
     * Only the comment's author may delete it.
     * All nested replies are cascade-deleted by the database automatically.
     *
     * @param {number} id          - The comment's ID.
     * @param {number} requesterId - The authenticated client's ID (from req.user.sub).
     * @returns {Promise<void>}
     * @throws {Error} If the comment is not found or the requester is not the author.
     */
    static async deleteComment(id, requesterId) {
        const entity = await CommentRepository.findById(id);
        if (!entity) throw new Error("Comment not found");

        if (Number(entity.client_id) !== Number(requesterId)) {
            throw new Error("Forbidden: you are not the author of this comment");
        }

        await CommentRepository.deleteById(id);

        // Keep the post's comment count in sync
        await PostRepository.adjustCommentCount(entity.post_id, -1);
    }
}

module.exports = CommentService;