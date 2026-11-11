const CommentService  = require("../services/comment.service");
const { handleError } = require("../utils/errorHandler");

/**
 * @class CommentController
 *
 * Handles HTTP requests for comment endpoints.
 * Delegates all business logic to CommentService and maps
 * service results or errors to appropriate HTTP responses.
 * The authenticated client's ID is read from req.user.sub,
 * which is set by the auth middleware after verifying the JWT.
 */
class CommentController {
    /**
     * GET /api/v1/comments/post/:postId
     * Retrieves all comments for a given post, ordered oldest first.
     * Includes both top-level comments and replies.
     *
     * @param {import('express').Request}  req - Express request. Params: { postId }.
     * @param {import('express').Response} res - Express response. Returns 200 with array of comment DTOs, or 404 if post not found.
     */
    static async getByPost(req, res) {
        try {
            const comments = await CommentService.getCommentsByPost(req.params.postId);
            res.json(comments);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/comments/:id/replies
     * Retrieves all direct replies to a given comment.
     *
     * @param {import('express').Request}  req - Express request. Params: { id } (the parent comment's ID).
     * @param {import('express').Response} res - Express response. Returns 200 with array of comment DTOs, or 404 if parent not found.
     */
    static async getReplies(req, res) {
        try {
            const replies = await CommentService.getReplies(req.params.id);
            res.json(replies);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * GET /api/v1/comments/:id
     * Retrieves a single comment by its ID.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with the comment DTO, or 404 if not found.
     */
    static async getById(req, res) {
        try {
            const comment = await CommentService.getCommentById(req.params.id);
            res.json(comment);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/comments
     * Creates a new comment or reply on a post.
     * If parentCommentId is provided in the body, the comment is a reply to that comment.
     * Otherwise it is a top-level comment on the post.
     *
     * @param {import('express').Request}  req - Express request. Body: { content, postId, parentCommentId? }.
     * @param {import('express').Response} res - Express response. Returns 201 with the new comment DTO.
     */
    static async create(req, res) {
        try {
            const comment = await CommentService.createComment(req.body, req.user.sub);
            res.status(201).json(comment);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * PUT /api/v1/comments/:id
     * Updates a comment's text content.
     * Only the comment's author may update it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }. Body: { content }.
     * @param {import('express').Response} res - Express response. Returns 200 with updated comment DTO, or 403/404 on failure.
     */
    static async update(req, res) {
        try {
            const comment = await CommentService.updateComment(
                req.params.id,
                req.body,
                req.user.sub
            );
            res.json(comment);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * DELETE /api/v1/comments/:id
     * Deletes a comment and all its nested replies.
     * Only the comment's author may delete it.
     *
     * @param {import('express').Request}  req - Express request. Params: { id }.
     * @param {import('express').Response} res - Express response. Returns 200 with success message, or 403/404 on failure.
     */
    static async deleteById(req, res) {
        try {
            await CommentService.deleteComment(req.params.id, req.user.sub);
            res.json({ message: "Comment deleted" });
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = CommentController;