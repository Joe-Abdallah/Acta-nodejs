const pool = require("../db/pool");
const PostVoteEntity = require("../entities/post-vote.entity");

/**
 * @class PostVoteRepository
 *
 * Handles all direct database operations for the `post_votes` table.
 * All methods are static. Returns PostVoteEntity instances — never raw rows.
 * A unique constraint on (client_id, post_id) ensures one vote per client per post.
 */
class PostVoteRepository {
    /**
     * Retrieves an existing vote cast by a specific client on a specific post.
     * Used to determine whether to insert, update, or delete a vote.
     *
     * @param {number} clientId - The client's ID.
     * @param {number} postId   - The post's ID.
     * @returns {Promise<PostVoteEntity|null>} The existing vote, or null if none exists.
     */
    static async findByClientAndPost(clientId, postId) {
        const result = await pool.query(
            `SELECT * FROM post_votes
             WHERE client_id = $1 AND post_id = $2`,
            [clientId, postId]
        );
        return PostVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Inserts a new vote for a client on a post.
     *
     * @param {number} clientId  - The client's ID.
     * @param {number} postId    - The post's ID.
     * @param {string} voteType  - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<PostVoteEntity>} The newly created vote entity.
     */
    static async create(clientId, postId, voteType) {
        const result = await pool.query(
            `INSERT INTO post_votes (vote_type, client_id, post_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [voteType, clientId, postId]
        );
        return PostVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates the vote type of an existing vote (e.g. switching UPVOTE to DOWNVOTE).
     *
     * @param {number} id       - The vote's ID.
     * @param {string} voteType - The new vote direction: "UPVOTE" or "DOWNVOTE".
     * @returns {Promise<PostVoteEntity>} The updated vote entity.
     */
    static async updateVoteType(id, voteType) {
        const result = await pool.query(
            `UPDATE post_votes SET vote_type = $1 WHERE id = $2 RETURNING *`,
            [voteType, id]
        );
        return PostVoteEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a vote by its primary key.
     * Used when a client toggles off their existing vote.
     *
     * @param {number} id - The vote's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM post_votes WHERE id = $1`, [id]);
    }
}

module.exports = PostVoteRepository;