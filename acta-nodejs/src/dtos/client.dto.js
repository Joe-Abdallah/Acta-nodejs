const ClientMapper = require("../mappers/client.mapper");

/**
 * @module ClientDto
 *
 * Client DTO – defines the API contract for client data.
 * All actual conversion logic lives in ClientMapper.
 *
 * Available conversions:
 * - toResponseDto      → entity → single client response object (no password).
 * - toListDto          → entities → array of client response objects.
 * - fromRegisterRequest → request body → plain data object for the repository.
 */
module.exports = {
    /**
     * Converts a single ClientEntity to a public-safe response DTO.
     * @type {function(import('../entities/client.entity')|null): object|null}
     */
    toResponseDto: ClientMapper.entityToResponseDto,

    /**
     * Converts an array of ClientEntity instances to an array of response DTOs.
     * @type {function(import('../entities/client.entity')[]): object[]}
     */
    toListDto: ClientMapper.entitiesToListDto,

    /**
     * Converts a registration request body to a plain data object for the repository.
     * The password in the body must already be hashed before calling this.
     * @type {function({ username: string, email: string, password: string }): object}
     */
    fromRegisterRequest: ClientMapper.registerRequestToData,
};