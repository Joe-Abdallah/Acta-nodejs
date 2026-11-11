const bcrypt = require("bcryptjs");
const ClientRepository  = require("../repositories/client.repository");
const ClientDto         = require("../dtos/client.dto");
const { generateToken } = require("../utils/token");

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

/**
 * @class AuthService
 *
 * Handles all authentication logic: registration and login.
 * Responsible for password hashing, credential validation,
 * and JWT token generation.
 */
class AuthService {
    /**
     * Registers a new client account.
     *
     * Validates that all fields are present, checks for duplicate email
     * and username, hashes the password, inserts the client, and returns
     * a JWT token along with the new client's public data.
     *
     * @param {{ username: string, email: string, password: string }} param - Registration data.
     * @returns {Promise<{ token: string, client: object }>} JWT token and the new client DTO.
     * @throws {Error} If any field is missing, or if the email/username is already taken.
     */
    static async register({ username, email, password }) {
        if (!username || !email || !password) {
            throw new Error("Username, email, and password are required");
        }

        // Check for duplicate email and username before attempting to insert
        const existingEmail = await ClientRepository.findByEmail(email);
        const existingUsername = await ClientRepository.findByUsername(username);

        if (existingEmail)    throw new Error("Email already in use");
        if (existingUsername) throw new Error("Username already taken");

        // Hash the password before storing — never store plaintext passwords
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const data = ClientDto.fromRegisterRequest({ username, email, password: hashedPassword });
        const entity = await ClientRepository.create(data);

        // Embed the client's ID and username in the token payload
        const token = generateToken({ sub: entity.id, username: entity.username });
        return { token, client: ClientDto.toResponseDto(entity) };
    }

    /**
     * Logs in an existing client.
     *
     * Looks up the client by email, compares the provided password
     * against the stored bcrypt hash, and returns a JWT token on success.
     *
     * @param {{ email: string, password: string }} param - Login credentials.
     * @returns {Promise<{ token: string, client: object }>} JWT token and the client DTO.
     * @throws {Error} If credentials are missing or invalid.
     */
    static async login({ email, password }) {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const entity = await ClientRepository.findByEmail(email);
        if (!entity) {
            // Use a generic message to avoid revealing whether the email exists
            throw new Error("Invalid credentials");
        }

        // Compare the provided password against the stored hash
        const passwordMatch = await bcrypt.compare(password, entity.password);
        if (!passwordMatch) {
            throw new Error("Invalid credentials");
        }

        const token = generateToken({ sub: entity.id, username: entity.username });
        return { token, client: ClientDto.toResponseDto(entity) };
    }
}

module.exports = AuthService;