const { pool } = require("../config/db");
const { planProduction } = require("./greedyPlanner");

async function calculateSuggestion() {
  // estoque
  const stockQ = await pool.query("SELECT id, stock_quantity FROM raw_material");
  const stock = new Map(stockQ.rows.map((r) => [Number(r.id), Number(r.stock_quantity)]));

  // produtos (ordenar aqui ou no planner — tanto faz; no planner já ordena)
  const productsQ = await pool.query(
    "SELECT id, TRIM(code) AS code, name, price FROM product"
  );

  // BOM de todos os produtos de uma vez (evita N queries)
  const bomQ = await pool.query(
    `
    SELECT product_id, raw_material_id, required_quantity
    FROM product_raw_material
    `
  );

  // monta map: productId -> bom[]
  const bomByProduct = new Map();
  for (const row of bomQ.rows) {
    const pid = Number(row.product_id);
    if (!bomByProduct.has(pid)) bomByProduct.set(pid, []);
    bomByProduct.get(pid).push({
      rawMaterialId: Number(row.raw_material_id),
      requiredQuantity: row.required_quantity,
    });
  }

  const products = productsQ.rows.map((p) => ({
    id: Number(p.id),
    code: p.code,
    name: p.name,
    price: p.price,
    bom: bomByProduct.get(Number(p.id)) || [],
  }));

  return planProduction(products, stock);
}

module.exports = { 
    calculateSuggestion 
};