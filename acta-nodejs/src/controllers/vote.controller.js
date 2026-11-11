const PostVoteService    = require("../services/post-vote.service");
const CommentVoteService = require("../services/comment-vote.service");
const { handleError }    = require("../utils/errorHandler");

/**
 * @class VoteController
 *
 * Handles HTTP requests for voting endpoints on both posts and comments.
 * Delegates all business logic to PostVoteService and CommentVoteService.
 * The authenticated client's ID is read from req.user.sub,
 * which is set by the auth middleware after verifying the JWT.
 */
class VoteController {
    /**
     * POST /api/v1/votes/posts/:postId
     * Casts, removes, or switches a vote on a post for the authenticated client.
     *
     * Vote behaviour:
     * - First vote      → inserts vote, returns { action: "voted",    voteType }
     * - Same vote again → removes vote (toggle off), returns { action: "unvoted" }
     * - Opposite vote   → switches vote, returns { action: "switched", voteType }
     *
     * @param {import('express').Request}  req - Express request. Params: { postId }. Body: { voteType }.
     * @param {import('express').Response} res - Express response. Returns 200 with vote result DTO.
     */
    static async voteOnPost(req, res) {
        try {
            const result = await PostVoteService.castVote(
                req.params.postId,
                req.user.sub,
                req.body.voteType
            );
            res.json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }

    /**
     * POST /api/v1/votes/comments/:commentId
     * Casts, removes, or switches a vote on a comment for the authenticated client.
     *
     * Vote behaviour:
     * - First vote      → inserts vote, returns { action: "voted",    voteType }
     * - Same vote again → removes vote (toggle off), returns { action: "unvoted" }
     * - Opposite vote   → switches vote, returns { action: "switched", voteType }
     *
     * @param {import('express').Request}  req - Express request. Params: { commentId }. Body: { voteType }.
     * @param {import('express').Response} res - Express response. Returns 200 with vote result DTO.
     */
    static async voteOnComment(req, res) {
        try {
            const result = await CommentVoteService.castVote(
                req.params.commentId,
                req.user.sub,
                req.body.voteType
            );
            res.json(result);
        } catch (err) {
            return handleError(res, err);
        }
    }
}

module.exports = VoteController;