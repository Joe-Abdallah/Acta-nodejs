/**
 * @class ClientEntity
 *
 * Represents a single row from the `clients` table.
 * Password is carried on the entity internally but is never exposed in any
 * response DTO — the mapper strips it before returning data to the client.
 */
class ClientEntity {
    /**
     * Creates a ClientEntity from a raw database row object.
     *
     * @param {Object} param
     * @param {number}  param.id         - Primary key.
     * @param {string}  param.username   - Unique display name.
     * @param {string}  param.email      - Unique email address.
     * @param {string}  param.password   - Bcrypt-hashed password.
     * @param {Date}    param.created_at - Account creation timestamp.
     */
    constructor({ id, username, email, password, created_at } = {}) {
        this.id         = id;
        this.username   = username;
        this.email      = email;
        this.password   = password;
        this.created_at = created_at;
    }

    /**
     * Creates a single ClientEntity from one database row.
     * Returns null if the row is falsy (e.g. query returned no results).
     *
     * @param {Object|null} row - Raw row object from pg query result.
     * @returns {ClientEntity|null}
     */
    static fromRow(row) {
        if (!row) return null;
        return new ClientEntity(row);
    }

    /**
     * Creates an array of ClientEntity instances from multiple database rows.
     *
     * @param {Object[]} rows - Array of raw row objects from pg query result.
     * @returns {ClientEntity[]}
     */
    static fromRows(rows) {
        return (rows || []).map((row) => ClientEntity.fromRow(row));
    }
}

module.exports = ClientEntity;