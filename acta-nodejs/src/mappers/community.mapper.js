/**
 * @module CommunityMapper
 *
 * Handles all conversions between CommunityEntity (database shape) and
 * Community DTOs (API response/request shape).
 */

/**
 * Converts a single CommunityEntity into a response DTO.
 * Includes nested creator and memberCount if available from the JOIN query.
 *
 * @param {import('../entities/community.entity')|null} entity - The community entity to convert.
 * @returns {{
 *   id: number,
 *   name: string,
 *   description: string|null,
 *   createdAt: Date,
 *   creatorId: number,
 *   creator?: { username: string },
 *   memberCount?: number
 * }|null}
 */
function entityToResponseDto(entity) {
    if (!entity) return null;
    return {
        id:          entity.id,
        name:        entity.name,
        description: entity.description,
        createdAt:   entity.created_at,
        creatorId:   entity.creator_id,
        // Only include nested objects if the data was joined in the query
        creator:     entity.creator_username
            ? { username: entity.creator_username }
            : undefined,
        memberCount: entity.member_count ?? undefined,
    };
}

/**
 * Converts an array of CommunityEntity instances into an array of response DTOs.
 *
 * @param {import('../entities/community.entity')[]} entities - Array of community entities.
 * @returns {object[]}
 */
function entitiesToListDto(entities) {
    return (entities || []).map(entityToResponseDto);
}

/**
 * Converts a create/update request body into a plain data object
 * ready to be passed to the repository.
 *
 * @param {{ name: string, description?: string }} body - Request body.
 * @returns {{ name: string, description: string|null }}
 */
function createRequestToData(body) {
    return { name: body.name, description: body.description ?? null };
}

module.exports = {
    entityToResponseDto,
    entitiesToListDto,
    createRequestToData,
};