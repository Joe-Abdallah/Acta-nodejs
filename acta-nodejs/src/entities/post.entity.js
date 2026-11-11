/**
 * @class PostEntity
 *
 * Represents a single row from the `posts` table.
 *
 * Join queries may also populate the following extra fields:
 * - `author_username` — the username of the client who created the post.
 * - `community_name`  — the name of the community the post belongs to.
 */
class PostEntity {
    /**
     * Creates a PostEntity from a raw database row object.
     *
     * @param {Object}  param
     * @param {number}  param.id               - Primary key.
     * @param {string}  param.title            - Post headline.
     * @param {string}  [param.content]        - Optional post body text.
     * @param {Date}    param.created_at        - Post creation timestamp.
     * @param {number}  param.vote_count        - Cached net vote count (upvotes − downvotes).
     * @param {number}  param.comment_count     - Cached total comment count.
     * @param {number}  param.client_id         - FK referencing the author's client ID.
     * @param {number}  param.community_id      - FK referencing the community ID.
     * @param {string}  [param.author_username] - Author's username (from JOIN).
     * @param {string}  [param.community_name]  - Community name (from JOIN).
     */
    constructor({
        id,
        title,
        content,
        created_at,
        vote_count,
        comment_count,
        client_id,
        community_id,
        author_username  = null,
        community_name   = null,
    } = {}) {
        this.id               = id;
        this.title            = title;
        this.content          = content ?? null;
        this.created_at       = created_at;
        this.vote_count       = vote_count;
        this.comment_count    = comment_count;
        this.client_id        = client_id;
        this.community_id     = community_id;
        this.author_username  = author_username;
        this.community_name   = community_name;
    }

    /**
     * Creates a single PostEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {PostEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PostEntity(row);
    }

    /**
     * Creates an array of PostEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {PostEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => PostEntity.fromRow(row));
    }
}

module.exports = PostEntity;