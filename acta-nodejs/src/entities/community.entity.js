/**
 * @class CommunityEntity
 *
 * Represents a single row from the `communities` table.
 *
 * Join queries may also populate the following extra fields:
 * - `creator_username` — the username of the client who created the community.
 * - `member_count`     — the total number of members in the community.
 */
class CommunityEntity {
    /**
     * Creates a CommunityEntity from a raw database row object.
     *
     * @param {Object}  param
     * @param {number}  param.id               - Primary key.
     * @param {string}  param.name             - Unique community name.
     * @param {string}  [param.description]    - Optional community description.
     * @param {Date}    param.created_at        - Community creation timestamp.
     * @param {number}  param.creator_id        - FK referencing the creator's client ID.
     * @param {string}  [param.creator_username]- Username of the creator (from JOIN).
     * @param {number}  [param.member_count]    - Total member count (from JOIN + COUNT).
     */
    constructor({
        id,
        name,
        description,
        created_at,
        creator_id,
        creator_username = null,
        member_count     = null,
    } = {}) {
        this.id               = id;
        this.name             = name;
        this.description      = description ?? null;
        this.created_at       = created_at;
        this.creator_id       = creator_id;
        this.creator_username = creator_username;
        this.member_count     = member_count;
    }

    /**
     * Creates a single CommunityEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {CommunityEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CommunityEntity(row);
    }

    /**
     * Creates an array of CommunityEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {CommunityEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => CommunityEntity.fromRow(row));
    }
}

module.exports = CommunityEntity;