const VoteMapper = require("../mappers/vote.mapper");

/**
 * @module VoteDto
 *
 * Vote DTO – defines the API contract for vote action results.
 * Acts as a thin delegation layer between the service layer and the mapper.
 * All actual conversion logic lives in VoteMapper.
 * Used by both PostVoteService and CommentVoteService so vote responses
 * are consistent across both resource types.
 *
 * Available conversions:
 * - toResponseDto → raw vote result → vote action response object.
 */
module.exports = {
    /**
     * Converts a raw vote action result to a response DTO.
     * Possible actions: "voted", "unvoted", "switched".
     * voteType is omitted from the response when action is "unvoted".
     * @type {function({ action: string, voteType?: string }): { action: string, voteType?: string }}
     */
    toResponseDto: VoteMapper.voteResultToDto,
};