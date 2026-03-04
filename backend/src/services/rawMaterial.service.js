const { pool } = require("../config/db");
const { assert, isNonEmptyString, isValidChar10, toNumber } = require("../utils/validators");

async function list() {
  const { rows } = await pool.query(
   `SELECT id, TRIM(code) AS code, name, stock_quantity AS "stockQuantity"
    FROM raw_material
    ORDER BY id ASC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
  `SELECT id, TRIM(code) AS code, name, stock_quantity AS "stockQuantity"
   FROM raw_material
   WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ code, name, stockQuantity }) {
  assert(isValidChar10(code), "Raw material code must be exactly 10 characters");
  assert(isNonEmptyString(name), "Raw material name is required");

  const sq = toNumber(stockQuantity);
  assert(sq !== null && sq >= 0, "Stock quantity must be a number >= 0");

  const { rows } = await pool.query(
    `
    INSERT INTO raw_material (code, name, stock_quantity)
    VALUES ($1, $2, $3)
    RETURNING id, TRIM(code) AS code, name, stock_quantity AS "stockQuantity"
    `,
    [code, name.trim(), sq]
  );
  return rows[0];
}

async function update(id, { code, name, stockQuantity }) {
  assert(isValidChar10(code), "Raw material code must be exactly 10 characters");
  assert(isNonEmptyString(name), "Raw material name is required");

  const sq = toNumber(stockQuantity);
  assert(sq !== null && sq >= 0, "Stock quantity must be a number >= 0");

  const { rows } = await pool.query(
    `
    UPDATE raw_material
    SET code = $1, name = $2, stock_quantity = $3
    WHERE id = $4
    RETURNING id, TRIM(code) AS code, name, stock_quantity AS "stockQuantity"
    `,
    [code, name.trim(), sq, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const result = await pool.query("DELETE FROM raw_material WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = { 
    list, 
    getById, 
    create, 
    update, 
    remove 
};