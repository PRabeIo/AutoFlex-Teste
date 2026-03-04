const request = require("supertest");
const app = require("../../src/app");
const { pool } = require("../../src/config/db");
const { seedDb } = require("./_db");

// (Opcional) log só pra confirmar banco/schema durante debug.
// Se não quiser logs, pode remover esse beforeAll.
beforeAll(async () => {
  const dbName = await pool.query("SELECT current_database() db, current_schema() schema");
  // eslint-disable-next-line no-console
  console.log("TEST DB:", dbName.rows[0]);
});

beforeEach(async () => {
  await seedDb();
});

test("GET /api/products returns list", async () => {
  const res = await request(app).get("/api/products");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);

  if (res.body.length > 0) {
    expect(res.body[0]).toHaveProperty("code");
  }
});

test("POST /api/products validates code length", async () => {
  const res = await request(app)
    .post("/api/products")
    .send({ code: "SHORT", name: "X", price: 1 });

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});