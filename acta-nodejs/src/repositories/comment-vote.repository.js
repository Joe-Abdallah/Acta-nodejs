const pool = require("../db/pool");
const CommentVoteEntity = require("../entities/comment-vote.entity");

/**
 * @class CommentVoteRepository
 *
 * Handles all direct database operations for the `comment_votes` table.
 * All methods are static. Returns CommentVoteEntity instances — never raw rows.
 * A unique constraint on (client_id, comment_id) ensures one vote per client per comment.
 */
class CommentVoteRepository {
    /**
     * Retrieves an existing vote cast by a specific client on a specific comment.
     * Used to determine whether to insert, update, or delete a vote.
     *
     * @param {number} clientId   - The client's ID.
     * @param {number} commentId  - The comment's ID.
     * @returns {Promise<CommentVoteEntity|null>} The existing vote, or null if none exists.
     */
    static async findByClientAndComment(clientId, commentId) {
        const result = await pool.query(
            `SELECT * FROM comment_votes
             WHERE client_id = $1 AND comment_id = $2`,
            [clientId, commentId]
        );
        return CommentVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Inserts a new vote for a client on a comment.
     *
     * @param {number} clientId  - The client's ID.
     * @param {number} commentId - The comment's ID.
     * @param {string} voteType  - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<CommentVoteEntity>} The newly created vote entity.
     */
    static async create(clientId, commentId, voteType) {
        const result = await pool.query(
            `INSERT INTO comment_votes (vote_type, client_id, comment_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [voteType, clientId, commentId]
        );
        return CommentVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates the vote type of an existing vote (e.g. switching UPVOTE to DOWNVOTE).
     *
     * @param {number} id       - The vote's ID.
     * @param {string} voteType - The new vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<CommentVoteEntity>} The updated vote entity.
     */
    static async updateVoteType(id, voteType) {
        const result = await pool.query(
            `UPDATE comment_votes SET vote_type = $1 WHERE id = $2 RETURNING *`,
            [voteType, id]
        );
        return CommentVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a vote by its primary key.
     * Used when a client toggles off their existing vote.
     *
     * @param {number} id - The vote's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM comment_votes WHERE id = $1`, [id]);
    }
}

module.exports = CommentVoteRepository;