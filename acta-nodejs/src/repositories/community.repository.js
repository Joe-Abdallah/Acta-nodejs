const pool = require("../db/pool");
const CommunityEntity = require("../entities/community.entity");

/**
 * @class CommunityRepository
 *
 * Handles all direct database operations for the `communities` table
 * and the `community_members` join table.
 * All methods are static. Returns CommunityEntity instances — never raw rows.
 * All find queries JOIN with clients and aggregate member counts for richer responses.
 */
class CommunityRepository {
    /**
     * Retrieves all communities with their creator's username and member count.
     *
     * @returns {Promise<CommunityEntity[]>}
     */
    static async findAll() {
        const result = await pool.query(
            `SELECT c.*,
                    cl.username AS creator_username,
                    COUNT(cm.client_id)::INT AS member_count
             FROM communities c
             JOIN clients cl ON cl.id = c.creator_id
             LEFT JOIN community_members cm ON cm.community_id = c.id
             GROUP BY c.id, cl.username
             ORDER BY c.id`
        );
        return CommunityEntity.fromRows(result.rows);
    }

    /**
     * Retrieves a single community by its primary key,
     * including creator username and member count.
     *
     * @param {number} id - The community's ID.
     * @returns {Promise<CommunityEntity|null>} The community entity, or null if not found.
     */
    static async findById(id) {
        const result = await pool.query(
            `SELECT c.*,
                    cl.username AS creator_username,
                    COUNT(cm.client_id)::INT AS member_count
             FROM communities c
             JOIN clients cl ON cl.id = c.creator_id
             LEFT JOIN community_members cm ON cm.community_id = c.id
             WHERE c.id = $1
             GROUP BY c.id, cl.username`,
            [id]
        );
        return CommunityEntity.fromRow(result.rows[0]);
    }

    /**
     * Retrieves a single community by its unique name.
     * Used to check for duplicate community names before creation.
     *
     * @param {string} name - The community's name.
     * @returns {Promise<CommunityEntity|null>} The community entity, or null if not found.
     */
    static async findByName(name) {
        const result = await pool.query(
            `SELECT c.*,
                    cl.username AS creator_username,
                    COUNT(cm.client_id)::INT AS member_count
             FROM communities c
             JOIN clients cl ON cl.id = c.creator_id
             LEFT JOIN community_members cm ON cm.community_id = c.id
             WHERE c.name = $1
             GROUP BY c.id, cl.username`,
            [name]
        );
        return CommunityEntity.fromRow(result.rows[0]);
    }

    /**
     * Inserts a new community into the database.
     *
     * @param {{ name: string, description: string|null, creatorId: number }} param - Community data.
     * @returns {Promise<CommunityEntity>} The newly created community entity (without join fields).
     */
    static async create({ name, description, creatorId }) {
        const result = await pool.query(
            `INSERT INTO communities (name, description, creator_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description, creatorId]
        );
        return CommunityEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates a community's name and description by its ID.
     *
     * @param {number} id - The community's ID.
     * @param {{ name: string, description: string|null }} param - Updated fields.
     * @returns {Promise<CommunityEntity|null>} The updated community entity (without join fields).
     */
    static async update(id, { name, description }) {
        const result = await pool.query(
            `UPDATE communities
             SET name = $1, description = $2
             WHERE id = $3
             RETURNING *`,
            [name, description, id]
        );
        return CommunityEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a community by its primary key.
     * All posts in this community and all memberships are cascade-deleted by the database.
     *
     * @param {number} id - The community's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM communities WHERE id = $1`, [id]);
    }

    /**
     * Checks whether a client is already a member of a community.
     *
     * @param {number} communityId - The community's ID.
     * @param {number} clientId    - The client's ID.
     * @returns {Promise<boolean>} True if the client is a member, false otherwise.
     */
    static async isMember(communityId, clientId) {
        const result = await pool.query(
            `SELECT 1 FROM community_members
             WHERE community_id = $1 AND client_id = $2`,
            [communityId, clientId]
        );
        return result.rowCount > 0;
    }

    /**
     * Adds a client as a member of a community.
     * Uses ON CONFLICT DO NOTHING to safely handle duplicate join attempts.
     *
     * @param {number} communityId - The community's ID.
     * @param {number} clientId    - The client's ID.
     * @returns {Promise<void>}
     */
    static async addMember(communityId, clientId) {
        await pool.query(
            `INSERT INTO community_members (community_id, client_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [communityId, clientId]
        );
    }

    /**
     * Removes a client from a community's membership.
     *
     * @param {number} communityId - The community's ID.
     * @param {number} clientId    - The client's ID.
     * @returns {Promise<void>}
     */
    static async removeMember(communityId, clientId) {
        await pool.query(
            `DELETE FROM community_members
             WHERE community_id = $1 AND client_id = $2`,
            [communityId, clientId]
        );
    }

    /**
     * Retrieves all communities that a given client has joined as a member.
     *
     * @param {number} clientId - The client's ID.
     * @returns {Promise<CommunityEntity[]>}
     */
    static async findByMember(clientId) {
        const result = await pool.query(
            `SELECT c.*,
                    cl.username AS creator_username,
                    COUNT(cm2.client_id)::INT AS member_count
             FROM communities c
             JOIN clients cl ON cl.id = c.creator_id
             JOIN community_members cm ON cm.community_id = c.id AND cm.client_id = $1
             LEFT JOIN community_members cm2 ON cm2.community_id = c.id
             GROUP BY c.id, cl.username
             ORDER BY c.id`,
            [clientId]
        );
        return CommunityEntity.fromRows(result.rows);
    }
}

module.exports = CommunityRepository;