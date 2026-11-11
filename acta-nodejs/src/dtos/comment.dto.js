const CommentMapper = require("../mappers/comment.mapper");

/**
 * @module CommentDto
 *
 * Comment DTO – defines the API contract for comment data.
 * All actual conversion logic lives in CommentMapper.
 *
 * Available conversions:
 * - toResponseDto     → entity → single comment response object.
 * - toListDto         → entities → array of comment response objects.
 * - fromCreateRequest → request body → plain data object for the repository.
 */
module.exports = {
    /**
     * Converts a single CommentEntity to a response DTO.
     * Includes nested author object and parentCommentId (null = top-level).
     * @type {function(import('../entities/comment.entity')|null): object|null}
     */
    toResponseDto: CommentMapper.entityToResponseDto,

    /**
     * Converts an array of CommentEntity instances to an array of response DTOs.
     * @type {function(import('../entities/comment.entity')[]): object[]}
     */
    toListDto: CommentMapper.entitiesToListDto,

    /**
     * Converts a create request body to a plain data object for the repository.
     * @type {function({ content: string, postId: number, parentCommentId?: number }): object}
     */
    fromCreateRequest: CommentMapper.createRequestToData,
};