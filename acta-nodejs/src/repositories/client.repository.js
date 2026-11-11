const pool = require("../db/pool");
const ClientEntity = require("../entities/client.entity");

/**
 * @class ClientRepository
 *
 * Handles all direct database operations for the `clients` table.
 * All methods are static. Returns ClientEntity instances or null — never raw rows.
 */
class ClientRepository {
    /**
     * Retrieves all clients ordered by ID ascending.
     *
     * @returns {Promise<ClientEntity[]>}
     */
    static async findAll() {
        const result = await pool.query(
            `SELECT * FROM clients ORDER BY id`
        );
        return ClientEntity.fromRows(result.rows);
    }

    /**
     * Retrieves a single client by their primary key.
     *
     * @param {number} id - The client's ID.
     * @returns {Promise<ClientEntity|null>} The client entity, or null if not found.
     */
    static async findById(id) {
        const result = await pool.query(
            `SELECT * FROM clients WHERE id = $1`,
            [id]
        );
        return ClientEntity.fromRow(result.rows[0]);
    }

    /**
     * Retrieves a single client by their email address.
     * Used during login to look up the account.
     *
     * @param {string} email - The client's email address.
     * @returns {Promise<ClientEntity|null>} The client entity, or null if not found.
     */
    static async findByEmail(email) {
        const result = await pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email]
        );
        return ClientEntity.fromRow(result.rows[0]);
    }

    /**
     * Retrieves a single client by their username.
     * Used during registration to check for duplicate usernames.
     *
     * @param {string} username - The client's username.
     * @returns {Promise<ClientEntity|null>} The client entity, or null if not found.
     */
    static async findByUsername(username) {
        const result = await pool.query(
            `SELECT * FROM clients WHERE username = $1`,
            [username]
        );
        return ClientEntity.fromRow(result.rows[0]);
    }

    /**
     * Inserts a new client into the database.
     * The password must already be hashed before being passed here.
     *
     * @param {{ username: string, email: string, password: string }} param - Client data.
     * @returns {Promise<ClientEntity>} The newly created client entity.
     */
    static async create({ username, email, password }) {
        const result = await pool.query(
            `INSERT INTO clients (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [username, email, password]
        );
        return ClientEntity.fromRow(result.rows[0]);
    }

    /**
     * Updates a client's username and email by their ID.
     *
     * @param {number} id - The client's ID.
     * @param {{ username: string, email: string }} param - Updated fields.
     * @returns {Promise<ClientEntity|null>} The updated client entity, or null if not found.
     */
    static async update(id, { username, email }) {
        const result = await pool.query(
            `UPDATE clients SET username = $1, email = $2 WHERE id = $3 RETURNING *`,
            [username, email, id]
        );
        return ClientEntity.fromRow(result.rows[0]);
    }

    /**
     * Deletes a client by their primary key.
     * All related posts, comments, votes, and owned communities are cascade-deleted
     * by the database automatically.
     *
     * @param {number} id - The client's ID.
     * @returns {Promise<void>}
     */
    static async deleteById(id) {
        await pool.query(`DELETE FROM clients WHERE id = $1`, [id]);
    }
}

module.exports = ClientRepository;