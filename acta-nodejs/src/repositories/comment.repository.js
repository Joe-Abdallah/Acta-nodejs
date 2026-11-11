const pool = require("../db/pool");
const CommentEntity = require("../entities/comment.entity");

/**
 * @class CommentRepository
 *
 * Handles all direct database operations for the `comments` table.
 * All methods are static. Returns CommentEntity instances — never raw rows.
 * Comments support self-referential nesting via parent_comment_id.
 * Cascade deletes are handled at the database level via ON DELETE CASCADE.
 */
class CommentRepository {
    /**
     * Retrieves all comments for a given post, ordered by oldest first.
     * Includes both top-level comments and replies.
     *
     * @param {number} postId - The post's ID.
     * @returns {Promise<CommentEntity[]>}
     */
    static async findByPost(postId) {
        const result = await pool.query(
            `SELECT c.*, cl.username AS author_username
             FROM comments c
             JOIN clients cl ON cl.id = c.client_id
             WHERE c.post_id = $1
             ORDER BY c.created_at ASC`,
            [postId]
        );
        return CommentEntity.fromRows(result.rows);
    }

    /**
     * Retrieves all direct replies to a given parent comment, ordered by oldest first.
     *
     * @param {number} parentCommentId - The parent comment's ID.
     * @returns {Promise<CommentEntity[]>}
     */
    static async findReplies(parentCommentId) {
        const result = await pool.query(
            `SELECT c.*, cl.username AS author_username
             FROM comments c
             JOIN clients cl ON cl.id = c.client_id
             WHERE c.parent_comment_id = $1
             ORDER BY c.created_at ASC`,
            [parentCommentId]
        );
        return CommentEntity.fromRows(result.rows);
    }

    /**
     * Retrieves a single comment by its primary key.
     *
     * @param {number} id - The comment's ID.
     * @returns {Promise<CommentEntity|null>} The comment entity, or null if not found.
     */
    static async findById(id) {
        const result = await pool.query(
            `SELECT c.*, cl.username AS author_username
             FROM comments c
             JOIN clients cl ON cl.id = c.client_id
             WHERE c.id = $1`,
            [id]
        );
        return CommentEntity.fromRow(result.rows[0]);
    }

    /**
     * Inserts a new comment or reply into the database.
     * If parentCommentId is null, the comment is a top-level comment on the post.
     * If parentCommentId is a number, the comment is a reply to that comment.
     *
     * @param {{ content: string, clientId: number, postId: number, parentCommentId: number|null }} param
     * @returns {Promise<CommentEntity>} The newly created comment entity (without join fields).
     */
    static async create({ content, clientId, postId, parentCommentId }) {
        const result = await pool.query(
            `INSERT INTO comments (content, client_id, post_id, parent_comment_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [content, clientId, postId, parentCommentId ?? null]
        );
        return CommentEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates a comment's content by its ID.
     *
     * @param {number} id               - The comment's ID.
     * @param {{ content: string }} param - Updated content.
     * @returns {Promise<CommentEntity|null>} The updated comment entity (without join fields).
     */
    static async update(id, { content }) {
        const result = await pool.query(
            `UPDATE comments SET content = $1 WHERE id = $2 RETURNING *`,
            [content, id]
        );
        return CommentEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a comment by its primary key.
     * All nested replies are cascade-deleted by the database automatically.
     *
     * @param {number} id - The comment's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM comments WHERE id = $1`, [id]);
    }

    /**
     * Adjusts the cached vote_count of a comment by a signed integer delta.
     * Called by CommentVoteService after every vote action.
     *
     * @param {number} id    - The comment's ID.
     * @param {number} delta - The signed amount to add to vote_count.
     * @returns {Promise<void>}
     */
    static async adjustVoteCount(id, delta) {
        await pool.query(
            `UPDATE comments SET vote_count = vote_count + $1 WHERE id = $2`,
            [delta, id]
        );
    }

    /**
     * Increments the vote_count of a comment by 1 (upvote from view layer).
     * @param {number} id - The comment's ID.
     * @returns {Promise<void>}
     */
    static async upvote(id) {
        await pool.query(
            `UPDATE comments SET vote_count = vote_count + 1 WHERE id = $1`,
            [id]
        );
    }
 
    /**
     * Decrements the vote_count of a comment by 1 (downvote from view layer).
     * @param {number} id - The comment's ID.
     * @returns {Promise<void>}
     */
    static async downvote(id) {
        await pool.query(
            `UPDATE comments SET vote_count = vote_count - 1 WHERE id = $1`,
            [id]
        );
    }
}

module.exports = CommentRepository;