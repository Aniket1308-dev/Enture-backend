const pool = require('../config/db');

// Create a new user
async function createUser(name, email, passwordHash) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

// Find a user by email (used during login, and to check for duplicates during register)
async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

// Find a user by id (used later e.g. in auth middleware / "get current user")
async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserById };