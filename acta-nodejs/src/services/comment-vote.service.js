const CommentVoteRepository = require("../repositories/comment-vote.repository");
const CommentRepository     = require("../repositories/comment.repository");
const VoteDto               = require("../dtos/vote.dto");

const VALID_VOTE_TYPES = ["UPVOTE", "DOWNVOTE"];

/**
 * Returns the numeric direction of a vote type.
 * Mirrors Spring Boot's VoteType.getType() pattern.
 *
 * @param {string} voteType - "UPVOTE" or "DOWNVOTE".
 * @returns {number} +1 for UPVOTE, -1 for DOWNVOTE.
 */
function direction(voteType) {
    return voteType === "UPVOTE" ? 1 : -1;
}

/**
 * @class CommentVoteService
 *
 * Handles all voting logic for comments.
 * Implements the same toggle/switch pattern as PostVoteService:
 * - Voting for the first time inserts a new vote and adjusts the count.
 * - Voting again with the same type removes the vote (toggle off).
 * - Voting with the opposite type switches the direction and adjusts by ±2.
 */
class CommentVoteService {
    /**
     * Casts, removes, or switches a vote on a comment for the authenticated client.
     *
     * Vote behaviour:
     * - No existing vote  → insert vote, adjust comment vote_count by +direction.
     * - Same vote again   → delete vote (toggle off), adjust by -direction.
     * - Opposite vote     → update vote type, adjust by direction × 2 (net swing of 2).
     *
     * @param {number} commentId - The comment's ID.
     * @param {number} clientId  - The authenticated client's ID (from req.user.sub).
     * @param {string} voteType  - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<{ action: string, voteType?: string }>} The vote result DTO.
     * @throws {Error} If voteType is invalid or the comment does not exist.
     */
    static async castVote(commentId, clientId, voteType) {
        if (!VALID_VOTE_TYPES.includes(voteType)) {
            throw new Error("Invalid vote type. Must be UPVOTE or DOWNVOTE");
        }

        const comment = await CommentRepository.findById(commentId);
        if (!comment) throw new Error("Comment not found");

        const existing = await CommentVoteRepository.findByClientAndComment(clientId, commentId);

        if (!existing) {
            // First time voting — insert and increment/decrement
            await CommentVoteRepository.create(clientId, commentId, voteType);
            await CommentRepository.adjustVoteCount(commentId, direction(voteType));
            return VoteDto.toResponseDto({ action: "voted", voteType });
        }

        if (existing.vote_type === voteType) {
            // Same vote sent again — toggle it off
            await CommentVoteRepository.deleteById(existing.id);
            await CommentRepository.adjustVoteCount(commentId, -direction(voteType));
            return VoteDto.toResponseDto({ action: "unvoted" });
        }

        // Opposite vote — switch direction. Net change is 2× the new direction
        // e.g. switching from DOWNVOTE(-1) to UPVOTE(+1) = net change of +2
        await CommentVoteRepository.updateVoteType(existing.id, voteType);
        await CommentRepository.adjustVoteCount(commentId, direction(voteType) * 2);
        return VoteDto.toResponseDto({ action: "switched", voteType });
    }
}

module.exports = CommentVoteService;