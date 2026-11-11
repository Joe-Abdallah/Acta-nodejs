/**
 * @class PostVoteEntity
 *
 * Represents a single row from the `post_votes` table.
 *
 * Each row records that a specific client voted on a specific post.
 * A unique constraint on (client_id, post_id) ensures a client can only
 * cast one vote per post at a time.
 */
class PostVoteEntity {
    /**
     * Creates a PostVoteEntity from a raw database row object.
     *
     * @param {Object} param
     * @param {number} param.id        - Primary key.
     * @param {string} param.vote_type - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @param {number} param.client_id - FK referencing the client who cast the vote.
     * @param {number} param.post_id   - FK referencing the post that was voted on.
     */
    constructor({ id, vote_type, client_id, post_id } = {}) {
        this.id        = id;
        this.vote_type = vote_type;
        this.client_id = client_id;
        this.post_id   = post_id;
    }

    /**
     * Creates a single PostVoteEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {PostVoteEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PostVoteEntity(row);
    }

    /**
     * Creates an array of PostVoteEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {PostVoteEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => PostVoteEntity.fromRow(row));
    }
}

module.exports = PostVoteEntity;