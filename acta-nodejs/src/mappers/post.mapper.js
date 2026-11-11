/**
 * @module PostMapper
 *
 * Handles all conversions between PostEntity (database shape) and
 * Post DTOs (API response/request shape).
 */

/**
 * Converts a single PostEntity into a response DTO.
 * Includes nested author and community objects if available from JOIN queries.
 *
 * @param {import('../entities/post.entity')|null} entity - The post entity to convert.
 * @returns {{
 *   id: number,
 *   title: string,
 *   content: string|null,
 *   createdAt: Date,
 *   voteCount: number,
 *   commentCount: number,
 *   author: { username: string }|{ id: number },
 *   community: { id: number, name: string }|{ id: number }
 * }|null}
 */
function entityToResponseDto(entity) {
    if (!entity) return null;
    return {
        id:           entity.id,
        title:        entity.title,
        content:      entity.content,
        createdAt:    entity.created_at,
        voteCount:    entity.vote_count,
        commentCount: entity.comment_count,
        // Use the joined username if available, otherwise fall back to the raw FK id
        author:       entity.author_username
            ? { username: entity.author_username }
            : { id: entity.client_id },
        community:    entity.community_name
            ? { id: entity.community_id, name: entity.community_name }
            : { id: entity.community_id },
    };
}

/**
 * Converts an array of PostEntity instances into an array of response DTOs.
 *
 * @param {import('../entities/post.entity')[]} entities - Array of post entities.
 * @returns {object[]}
 */
function entitiesToListDto(entities) {
    return (entities || []).map(entityToResponseDto);
}

/**
 * Converts a create request body into a plain data object
 * ready to be passed to the repository.
 *
 * @param {{ title: string, content?: string, communityId: number }} body - Request body.
 * @returns {{ title: string, content: string|null, communityId: number }}
 */
function createRequestToData(body) {
    return {
        title:       body.title,
        content:     body.content ?? null,
        communityId: body.communityId,
    };
}

/**
 * Converts an update request body into a plain data object
 * ready to be passed to the repository.
 * communityId is not included — posts cannot be moved between communities.
 *
 * @param {{ title: string, content?: string }} body - Request body.
 * @returns {{ title: string, content: string|null }}
 */
function updateRequestToData(body) {
    return { title: body.title, content: body.content ?? null };
}

module.exports = {
    entityToResponseDto,
    entitiesToListDto,
    createRequestToData,
    updateRequestToData,
};