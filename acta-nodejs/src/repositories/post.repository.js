const pool = require("../db/pool");
const PostEntity = require("../entities/post.entity");

/**
 * @class PostRepository
 *
 * Handles all direct database operations for the `posts` table.
 * All methods are static. Returns PostEntity instances — never raw rows.
 * All find queries JOIN with clients and communities to enrich the response
 * with author username and community name.
 */
class PostRepository {
    /**
     * Retrieves all posts across all communities, ordered by newest first.
     *
     * @returns {Promise<PostEntity[]>}
     */
    static async findAll() {
        const result = await pool.query(
            `SELECT p.*,
                    cl.username   AS author_username,
                    co.name       AS community_name
             FROM posts p
             JOIN clients     cl ON cl.id = p.client_id
             JOIN communities co ON co.id = p.community_id
             ORDER BY p.created_at DESC`
        );
        return PostEntity.fromRows(result.rows);
    }

    /**
     * Retrieves a single post by its primary key.
     *
     * @param {number} id - The post's ID.
     * @returns {Promise<PostEntity|null>} The post entity, or null if not found.
     */
    static async findById(id) {
        const result = await pool.query(
            `SELECT p.*,
                    cl.username   AS author_username,
                    co.name       AS community_name
             FROM posts p
             JOIN clients     cl ON cl.id = p.client_id
             JOIN communities co ON co.id = p.community_id
             WHERE p.id = $1`,
            [id]
        );
        return PostEntity.fromRow(result.rows[0]);
    }

    /**
     * Retrieves all posts belonging to a specific community, ordered by newest first.
     *
     * @param {number} communityId - The community's ID.
     * @returns {Promise<PostEntity[]>}
     */
    static async findByCommunity(communityId) {
        const result = await pool.query(
            `SELECT p.*,
                    cl.username   AS author_username,
                    co.name       AS community_name
             FROM posts p
             JOIN clients     cl ON cl.id = p.client_id
             JOIN communities co ON co.id = p.community_id
             WHERE p.community_id = $1
             ORDER BY p.created_at DESC`,
            [communityId]
        );
        return PostEntity.fromRows(result.rows);
    }

    /**
     * Retrieves all posts authored by a specific client, ordered by newest first.
     *
     * @param {number} clientId - The author's client ID.
     * @returns {Promise<PostEntity[]>}
     */
    static async findByAuthor(clientId) {
        const result = await pool.query(
            `SELECT p.*,
                    cl.username   AS author_username,
                    co.name       AS community_name
             FROM posts p
             JOIN clients     cl ON cl.id = p.client_id
             JOIN communities co ON co.id = p.community_id
             WHERE p.client_id = $1
             ORDER BY p.created_at DESC`,
            [clientId]
        );
        return PostEntity.fromRows(result.rows);
    }

    /**
     * Inserts a new post into the database.
     * vote_count and comment_count default to 0 in the database.
     *
     * @param {{ title: string, content: string|null, clientId: number, communityId: number }} param
     * @returns {Promise<PostEntity>} The newly created post entity (without join fields).
     */
    static async create({ title, content, clientId, communityId }) {
        const result = await pool.query(
            `INSERT INTO posts (title, content, client_id, community_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title, content, clientId, communityId]
        );
        return PostEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates a post's title and content by its ID.
     *
     * @param {number} id - The post's ID.
     * @param {{ title: string, content: string|null }} param - Updated fields.
     * @returns {Promise<PostEntity|null>} The updated post entity (without join fields).
     */
    static async update(id, { title, content }) {
        const result = await pool.query(
            `UPDATE posts
             SET title = $1, content = $2
             WHERE id = $3
             RETURNING *`,
            [title, content, id]
        );
        return PostEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a post by its primary key.
     * All comments and votes on this post are cascade-deleted by the database.
     *
     * @param {number} id - The post's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM posts WHERE id = $1`, [id]);
    }

    /**
     * Adjusts the cached vote_count of a post by a signed integer delta.
     * Called by PostVoteService after every vote action:
     * - New vote:      delta = +1 or -1
     * - Removed vote:  delta = -1 or +1
     * - Switched vote: delta = +2 or -2
     *
     * @param {number} id    - The post's ID.
     * @param {number} delta - The signed amount to add to vote_count.
     * @returns {Promise<void>}
     */
    static async adjustVoteCount(id, delta) {
        await pool.query(
            `UPDATE posts SET vote_count = vote_count + $1 WHERE id = $2`,
            [delta, id]
        );
    }

    /**
     * Adjusts the cached comment_count of a post by a signed integer delta.
     * Called by CommentService after a comment is created (+1) or deleted (-1).
     *
     * @param {number} id    - The post's ID.
     * @param {number} delta - +1 when a comment is created, -1 when deleted.
     * @returns {Promise<void>}
     */
    static async adjustCommentCount(id, delta) {
        await pool.query(
            `UPDATE posts SET comment_count = comment_count + $1 WHERE id = $2`,
            [delta, id]
        );
    }

    /**
     * Increments the vote_count of a post by 1 (upvote from view layer).
     * Used by the view layer
     * @param {number} id - The post's ID.
     * @returns {Promise<void>}
     */
    static async upvote(id) {
        await pool.query(
            `UPDATE posts SET vote_count = vote_count + 1 WHERE id = $1`,
            [id]
        );
    }
 
    /**
     * Decrements the vote_count of a post by 1 (downvote from view layer).
     * Used by the view layer
     * @param {number} id - The post's ID.
     * @returns {Promise<void>}
     */
    static async downvote(id) {
        await pool.query(
            `UPDATE posts SET vote_count = vote_count - 1 WHERE id = $1`,
            [id]
        );
    }
}

module.exports = PostRepository;