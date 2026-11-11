const PostVoteRepository = require("../repositories/post-vote.repository");
const PostRepository     = require("../repositories/post.repository");
const VoteDto            = require("../dtos/vote.dto");

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
 * @class PostVoteService
 *
 * Handles all voting logic for posts.
 * Implements a toggle/switch pattern:
 * - Voting for the first time inserts a new vote and adjusts the count.
 * - Voting again with the same type removes the vote (toggle off).
 * - Voting with the opposite type switches the direction and adjusts by ±2.
 */
class PostVoteService {
    /**
     * Casts, removes, or switches a vote on a post for the authenticated client.
     *
     * Vote behaviour:
     * - No existing vote  → insert vote, adjust post vote_count by +direction.
     * - Same vote again   → delete vote (toggle off), adjust by -direction.
     * - Opposite vote     → update vote type, adjust by direction × 2 (net swing of 2).
     *
     * @param {number} postId   - The post's ID.
     * @param {number} clientId - The authenticated client's ID (from req.user.sub).
     * @param {string} voteType - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<{ action: string, voteType?: string }>} The vote result DTO.
     * @throws {Error} If voteType is invalid or the post does not exist.
     */
    static async castVote(postId, clientId, voteType) {
        if (!VALID_VOTE_TYPES.includes(voteType)) {
            throw new Error("Invalid vote type. Must be UPVOTE or DOWNVOTE");
        }

        const post = await PostRepository.findById(postId);
        if (!post) throw new Error("Post not found");

        const existing = await PostVoteRepository.findByClientAndPost(clientId, postId);

        if (!existing) {
            // First time voting — insert and increment/decrement
            await PostVoteRepository.create(clientId, postId, voteType);
            await PostRepository.adjustVoteCount(postId, direction(voteType));
            return VoteDto.toResponseDto({ action: "voted", voteType });
        }

        if (existing.vote_type === voteType) {
            // Same vote sent again — toggle it off
            await PostVoteRepository.deleteById(existing.id);
            await PostRepository.adjustVoteCount(postId, -direction(voteType));
            return VoteDto.toResponseDto({ action: "unvoted" });
        }

        // Opposite vote — switch direction. Net change is 2× the new direction
        // e.g. switching from DOWNVOTE(-1) to UPVOTE(+1) = net change of +2
        await PostVoteRepository.updateVoteType(existing.id, voteType);
        await PostRepository.adjustVoteCount(postId, direction(voteType) * 2);
        return VoteDto.toResponseDto({ action: "switched", voteType });
    }
}

module.exports = PostVoteService;