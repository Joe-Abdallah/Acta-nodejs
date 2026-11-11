/**
 * @class CommentEntity
 *
 * Represents a single row from the `comments` table.
 *
 * Comments support unlimited nesting through a self-referential relationship:
 * - `parent_comment_id = null`  → top-level comment on a post.
 * - `parent_comment_id = <id>`  → a reply to another comment.
 *
 * Deleting a comment cascades to all its replies at the database level.
 *
 * Join queries may also populate:
 * - `author_username` — the username of the client who wrote the comment.
 */
class CommentEntity {
    /**
     * Creates a CommentEntity from a raw database row object.
     *
     * @param {Object}  param
     * @param {number}  param.id                 - Primary key.
     * @param {string}  param.content            - The comment text.
     * @param {Date}    param.created_at          - Comment creation timestamp.
     * @param {number}  param.vote_count          - Cached net vote count (upvotes − downvotes).
     * @param {number}  param.client_id           - FK referencing the author's client ID.
     * @param {number}  param.post_id             - FK referencing the post this comment belongs to.
     * @param {number}  [param.parent_comment_id] - FK referencing the parent comment (null if top-level).
     * @param {string}  [param.author_username]   - Author's username (from JOIN).
     */
    constructor({
        id,
        content,
        created_at,
        vote_count,
        client_id,
        post_id,
        parent_comment_id = null,
        author_username   = null,
    } = {}) {
        this.id                = id;
        this.content           = content;
        this.created_at        = created_at;
        this.vote_count        = vote_count;
        this.client_id         = client_id;
        this.post_id           = post_id;
        this.parent_comment_id = parent_comment_id;
        this.author_username   = author_username;
    }

    /**
     * Creates a single CommentEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {CommentEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CommentEntity(row);
    }

    /**
     * Creates an array of CommentEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {CommentEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => CommentEntity.fromRow(row));
    }
}

module.exports = CommentEntity;