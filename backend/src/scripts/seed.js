require("dotenv").config();
const { pool } = require("../config/db");

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Limpa tudo (ordem importa por FK)
    await client.query("DELETE FROM product_raw_material");
    await client.query("DELETE FROM product");
    await client.query("DELETE FROM raw_material");

    // (Opcional) resetar ids pra começar em 1 (funciona no Postgres)
    await client.query("ALTER SEQUENCE product_raw_material_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE product_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE raw_material_id_seq RESTART WITH 1");

    // Raw materials
    const rm1 = await client.query(
      `INSERT INTO raw_material (code, name, stock_quantity)
       VALUES ($1,$2,$3)
       RETURNING id`,
      ["RM00000001", "Plastic", 10.0]
    );

    const rm2 = await client.query(
      `INSERT INTO raw_material (code, name, stock_quantity)
       VALUES ($1,$2,$3)
       RETURNING id`,
      ["RM00000002", "Screw", 40.0]
    );

    const plasticId = rm1.rows[0].id;
    const screwId = rm2.rows[0].id;

    // Products
    const pHigh = await client.query(
      `INSERT INTO product (code, name, price)
       VALUES ($1,$2,$3)
       RETURNING id`,
      ["P000000001", "Premium Chair", 200.0]
    );

    const pMid = await client.query(
      `INSERT INTO product (code, name, price)
       VALUES ($1,$2,$3)
       RETURNING id`,
      ["P000000002", "Standard Chair", 120.0]
    );

    const pLow = await client.query(
      `INSERT INTO product (code, name, price)
       VALUES ($1,$2,$3)
       RETURNING id`,
      ["P000000003", "Cheap Chair", 50.0]
    );

    const premiumId = pHigh.rows[0].id;
    const standardId = pMid.rows[0].id;
    const cheapId = pLow.rows[0].id;

    // BOM:
    // Premium uses 2 plastic + 8 screws
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [premiumId, plasticId, 2.0]
    );
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [premiumId, screwId, 8.0]
    );

    // Standard uses 2 plastic + 4 screws
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [standardId, plasticId, 2.0]
    );
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [standardId, screwId, 4.0]
    );

    // Cheap uses 1 plastic + 2 screws
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [cheapId, plasticId, 1.0]
    );
    await client.query(
      `INSERT INTO product_raw_material (product_id, raw_material_id, required_quantity)
       VALUES ($1,$2,$3)`,
      [cheapId, screwId, 2.0]
    );

    await client.query("COMMIT");
    console.log("Seed completed successfully ✅");
    console.log({ plasticId, screwId, premiumId, standardId, cheapId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed ❌", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();