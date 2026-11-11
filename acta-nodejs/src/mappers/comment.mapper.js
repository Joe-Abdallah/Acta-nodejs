/**
 * @module CommentMapper
 *
 * Handles all conversions between CommentEntity (database shape) and
 * Comment DTOs (API response/request shape).
 */

/**
 * Converts a single CommentEntity into a response DTO.
 * Includes the nested author object if available from a JOIN query.
 *
 * @param {import('../entities/comment.entity')|null} entity - The comment entity to convert.
 * @returns {{
 *   id: number,
 *   content: string,
 *   createdAt: Date,
 *   voteCount: number,
 *   postId: number,
 *   parentCommentId: number|null,
 *   author: { username: string }|{ id: number }
 * }|null}
 */
function entityToResponseDto(entity) {
    if (!entity) return null;
    return {
        id:              entity.id,
        content:         entity.content,
        createdAt:       entity.created_at,
        voteCount:       entity.vote_count,
        postId:          entity.post_id,
        // null means this is a top-level comment, a number means it's a reply
        parentCommentId: entity.parent_comment_id,
        // Use the joined username if available, otherwise fall back to the raw FK id
        author:          entity.author_username
            ? { username: entity.author_username }
            : { id: entity.client_id },
    };
}

/**
 * Converts an array of CommentEntity instances into an array of response DTOs.
 *
 * @param {import('../entities/comment.entity')[]} entities - Array of comment entities.
 * @returns {object[]}
 */
function entitiesToListDto(entities) {
    return (entities || []).map(entityToResponseDto);
}

/**
 * Converts a create request body into a plain data object
 * ready to be passed to the repository.
 *
 * @param {{ content: string, postId: number, parentCommentId?: number }} body - Request body.
 * @returns {{ content: string, postId: number, parentCommentId: number|null }}
 */
function createRequestToData(body) {
    return {
        content:         body.content,
        postId:          body.postId,
        // null = top-level comment, a number = reply to another comment
        parentCommentId: body.parentCommentId ?? null,
    };
}

module.exports = {
    entityToResponseDto,
    entitiesToListDto,
    createRequestToData,
};