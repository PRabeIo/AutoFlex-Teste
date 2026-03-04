const { pool } = require("../config/db");
const { assert, toNumber } = require("../utils/validators");

function toIntId(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
  }
  return n;
}

async function listByProduct(productId) {
  const { rows } = await pool.query(
    `
    SELECT
      prm.id,
      prm.product_id AS "productId",
      prm.raw_material_id AS "rawMaterialId",
      prm.required_quantity AS "requiredQuantity",
      TRIM(rm.code) AS "rawMaterialCode",
      rm.name AS "rawMaterialName"
    FROM product_raw_material prm
    JOIN raw_material rm ON rm.id = prm.raw_material_id
    WHERE prm.product_id = $1
    ORDER BY rm.name ASC
    `,
    [productId]
  );
  return rows;
}

async function addItem(productId, rawMaterialId, requiredQuantity) {
  const rmId = toIntId(rawMaterialId, "rawMaterialId");

  const rq = toNumber(requiredQuantity);
  assert(rq !== null && rq > 0, "Required quantity must be a number > 0");

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
      VALUES ($1, $2, $3)
      RETURNING id,
                product_id AS "productId",
                raw_material_id AS "rawMaterialId",
                required_quantity AS "requiredQuantity"
      `,
      [productId, rmId, rq]
    );

    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw Object.assign(
        new Error("This raw material is already associated with the product"),
        { statusCode: 409 }
      );
    }
    throw err;
  }
}

async function updateItem(productId, itemId, requiredQuantity) {
  const rq = toNumber(requiredQuantity);
  assert(rq !== null && rq > 0, "Required quantity must be a number > 0");

  const { rows } = await pool.query(
    `
    UPDATE product_raw_material
    SET required_quantity = $1
    WHERE id = $2 AND product_id = $3
    RETURNING id,
              product_id AS "productId",
              raw_material_id AS "rawMaterialId",
              required_quantity AS "requiredQuantity"
    `,
    [rq, itemId, productId]
  );

  return rows[0] || null;
}

async function removeItem(productId, itemId) {
  const result = await pool.query(
    "DELETE FROM product_raw_material WHERE id = $1 AND product_id = $2",
    [itemId, productId]
  );
  return result.rowCount > 0;
}

module.exports = { 
    listByProduct, 
    addItem, 
    updateItem, 
    removeItem 
};