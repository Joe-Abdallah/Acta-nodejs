/**
 * PostgreSQL connection pool.
 *
 * Creates a shared pool of database connections using credentials
 * from environment variables. The pool is reused across all repositories
 * so the application does not open a new connection on every query.
 *
 * Environment variables required:
 * - PG_USER     – database username
 * - PG_PASS     – database password
 * - PG_HOST     – database host 
 * - PG_DATABASE – database name 
 */

const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT) || 5432,
});

module.exports = pool;
