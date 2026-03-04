const { pool } = require("../../src/config/db");

async function resetDb() {
  // ordem: tabela de associação primeiro, depois tabelas principais
  await pool.query("TRUNCATE TABLE product_raw_material RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE product RESTART IDENTITY CASCADE");
  await pool.query("TRUNCATE TABLE raw_material RESTART IDENTITY CASCADE");
}

async function seedDb() {
  // sempre começa limpo
  await resetDb();

  const rm1 = await pool.query(
    "INSERT INTO raw_material (code, name, stock_quantity) VALUES ($1,$2,$3) RETURNING id",
    ["RM00000001", "Rubber", 50]
  );

  const rm2 = await pool.query(
    "INSERT INTO raw_material (code, name, stock_quantity) VALUES ($1,$2,$3) RETURNING id",
    ["RM00000002", "Plastic", 100]
  );

  const p1 = await pool.query(
    "INSERT INTO product (code, name, price) VALUES ($1,$2,$3) RETURNING id",
    ["P000000001", "Rubber Grip", 10]
  );

  await pool.query(
    "INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity) VALUES ($1,$2,$3)",
    [p1.rows[0].id, rm1.rows[0].id, 5]
  );

  return {
    rawMaterials: { rm1Id: rm1.rows[0].id, rm2Id: rm2.rows[0].id },
    products: { p1Id: p1.rows[0].id },
  };
}

async function closeDb() {
  await pool.end();
}

module.exports = { resetDb, seedDb, closeDb };