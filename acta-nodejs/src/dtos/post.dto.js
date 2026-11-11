const PostMapper = require("../mappers/post.mapper");

/**
 * @module PostDto
 *
 * Post DTO – defines the API contract for post data.
 * All actual conversion logic lives in PostMapper.
 *
 * Available conversions:
 * - toResponseDto     → entity → single post response object.
 * - toListDto         → entities → array of post response objects.
 * - fromCreateRequest → request body → plain data object for the repository (create).
 * - fromUpdateRequest → request body → plain data object for the repository (update).
 */
module.exports = {
    /**
     * Converts a single PostEntity to a response DTO.
     * Includes nested author and community objects if available from a JOIN query.
     * @type {function(import('../entities/post.entity')|null): object|null}
     */
    toResponseDto: PostMapper.entityToResponseDto,

    /**
     * Converts an array of PostEntity instances to an array of response DTOs.
     * @type {function(import('../entities/post.entity')[]): object[]}
     */
    toListDto: PostMapper.entitiesToListDto,

    /**
     * Converts a create request body to a plain data object for the repository.
     * @type {function({ title: string, content?: string, communityId: number }): object}
     */
    fromCreateRequest: PostMapper.createRequestToData,

    /**
     * Converts an update request body to a plain data object for the repository.
     * communityId is excluded — posts cannot be moved between communities.
     * @type {function({ title: string, content?: string }): object}
     */
    fromUpdateRequest: PostMapper.updateRequestToData,
};