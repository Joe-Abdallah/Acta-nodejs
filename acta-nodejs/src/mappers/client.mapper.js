/**
 * @module ClientMapper
 *
 * Handles all conversions between ClientEntity (database shape) and
 * Client DTOs (API response/request shape).
 *
 * The password field is intentionally never included in any response DTO.
 */

/**
 * Converts a single ClientEntity into a public-safe response DTO.
 * Strips the password field, this DTO is safe to send to the client.
 *
 * @param {import('../entities/client.entity')|null} entity - The client entity to convert.
 * @returns {{ id: number, username: string, email: string, createdAt: Date }|null}
 */
function entityToResponseDto(entity) {
    if (!entity) return null;
    return {
        id:        entity.id,
        username:  entity.username,
        email:     entity.email,
        createdAt: entity.created_at,
    };
}

/**
 * Converts an array of ClientEntity instances into an array of response DTOs.
 *
 * @param {import('../entities/client.entity')[]} entities - Array of client entities.
 * @returns {{ id: number, username: string, email: string, createdAt: Date }[]}
 */
function entitiesToListDto(entities) {
    return (entities || []).map(entityToResponseDto);
}

/**
 * Converts a registration request body into a plain data object
 * ready to be passed to the repository for insertion.
 * The password passed here should already be hashed before calling this function.
 *
 * @param {{ username: string, email: string, password: string }} body - Request body.
 * @returns {{ username: string, email: string, password: string }}
 */
function registerRequestToData(body) {
    return { username: body.username, email: body.email, password: body.password };
}

module.exports = {
    entityToResponseDto,
    entitiesToListDto,
    registerRequestToData,
};