/**
 * @class CommentVoteEntity
 *
 * Represents a single row from the `comment_votes` table.
 *
 * Each row records that a specific client voted on a specific comment.
 * A unique constraint on (client_id, comment_id) ensures a client can only
 * cast one vote per comment at a time.
 */
class CommentVoteEntity {
    /**
     * Creates a CommentVoteEntity from a raw database row object.
     *
     * @param {Object} param
     * @param {number} param.id         - Primary key.
     * @param {string} param.vote_type  - The vote direction: "UPVOTE" or "DOWNVOTE".
     * @param {number} param.client_id  - FK referencing the client who cast the vote.
     * @param {number} param.comment_id - FK referencing the comment that was voted on.
     */
    constructor({ id, vote_type, client_id, comment_id } = {}) {
        this.id         = id;
        this.vote_type  = vote_type;
        this.client_id  = client_id;
        this.comment_id = comment_id;
    }

    /**
     * Creates a single CommentVoteEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {CommentVoteEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CommentVoteEntity(row);
    }

    /**
     * Creates an array of CommentVoteEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {CommentVoteEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => CommentVoteEntity.fromRow(row));
    }
}

module.exports = CommentVoteEntity;