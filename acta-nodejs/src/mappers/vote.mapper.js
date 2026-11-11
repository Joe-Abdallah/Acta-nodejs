/**
 * @module VoteMapper
 *
 * Handles conversions for vote action results into response DTOs.
 * Used by both PostVoteService and CommentVoteService so the vote
 * response shape is consistent across both resource types.
 */

/**
 * Converts a vote action result into a response DTO.
 *
 * Possible actions:
 * - "voted"    — a new vote was cast (first time voting on this resource).
 * - "unvoted"  — the vote was removed (same voteType sent twice, toggled off).
 * - "switched" — the vote direction was changed (e.g. UPVOTE → DOWNVOTE).
 *
 * @param {{ action: string, voteType?: string }} result - The vote result object.
 * @param {string}  result.action   - The action that was performed.
 * @param {string}  [result.voteType] - The final vote type ("UPVOTE" or "DOWNVOTE"). Omitted on "unvoted".
 * @returns {{ action: string, voteType?: string }}
 */
function voteResultToDto(result) {
    return {
        action:   result.action,
        voteType: result.voteType ?? undefined,
    };
}

module.exports = { voteResultToDto };