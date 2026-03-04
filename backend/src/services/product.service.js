const { pool } = require("../config/db");
const bomService = require("./bom.service");
const { assert, isNonEmptyString, isValidChar10, toNumber } = require("../utils/validators");

async function list() {
  const { rows } = await pool.query(
    "SELECT id, TRIM(code) AS code, name, price FROM product ORDER BY id ASC"
  );
  return rows;
}

async function getById(id) {
  const productQ = await pool.query(
    "SELECT id, TRIM(code) AS code, name, price FROM product WHERE id = $1",
    [id]
  );
  if (productQ.rows.length === 0) return null;

  const bom = await bomService.listByProduct(id);
  return { ...productQ.rows[0], bom };
}

async function create({ code, name, price }) {
  assert(isValidChar10(code), "Product code must be exactly 10 characters");
  assert(isNonEmptyString(name), "Product name is required");

  const p = toNumber(price);
  assert(p !== null && p >= 0, "Product price must be a number >= 0");

  const { rows } = await pool.query(
    "INSERT INTO product (code, name, price) VALUES ($1, $2, $3) RETURNING id, TRIM(code) AS code, name, price",
    [code, name.trim(), p]
  );
  return rows[0];
}

async function update(id, { code, name, price }) {
  assert(isValidChar10(code), "Product code must be exactly 10 characters");
  assert(isNonEmptyString(name), "Product name is required");

  const p = toNumber(price);
  assert(p !== null && p >= 0, "Product price must be a number >= 0");

  const { rows } = await pool.query(
    `
    UPDATE product
    SET code = $1, name = $2, price = $3
    WHERE id = $4
    RETURNING id, TRIM(code) AS code, name, price
    `,
    [code, name.trim(), p, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const result = await pool.query("DELETE FROM product WHERE id = $1", [id]);
  return result.rowCount > 0;
}

function listMaterials(productId) {
  return bomService.listByProduct(productId);
}

function addMaterial(productId, { rawMaterialId, requiredQuantity }) {
  return bomService.addItem(productId, rawMaterialId, requiredQuantity);
}

function updateMaterial(productId, itemId, { requiredQuantity }) {
  return bomService.updateItem(productId, itemId, requiredQuantity);
}

function removeMaterial(productId, itemId) {
  return bomService.removeItem(productId, itemId);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listMaterials,
  addMaterial,
  updateMaterial,
  removeMaterial,
};