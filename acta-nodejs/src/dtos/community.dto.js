const CommunityMapper = require("../mappers/community.mapper");

/**
 * @module CommunityDto
 *
 * Community DTO – defines the API contract for community data.
 * All actual conversion logic lives in CommunityMapper.
 *
 * Available conversions:
 * - toResponseDto     → entity → single community response object.
 * - toListDto         → entities → array of community response objects.
 * - fromCreateRequest → request body → plain data object for the repository.
 */
module.exports = {
    /**
     * Converts a single CommunityEntity to a response DTO.
     * Includes nested creator and memberCount if available from a JOIN query.
     * @type {function(import('../entities/community.entity')|null): object|null}
     */
    toResponseDto: CommunityMapper.entityToResponseDto,

    /**
     * Converts an array of CommunityEntity instances to an array of response DTOs.
     * @type {function(import('../entities/community.entity')[]): object[]}
     */
    toListDto: CommunityMapper.entitiesToListDto,

    /**
     * Converts a create/update request body to a plain data object for the repository.
     * @type {function({ name: string, description?: string }): object}
     */
    fromCreateRequest: CommunityMapper.createRequestToData,
};