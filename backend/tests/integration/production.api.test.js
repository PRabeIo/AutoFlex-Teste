const request = require("supertest");
const app = require("../../src/app");
const { seedDb } = require("./_db");

beforeEach(async () => {
  await seedDb();
});

test("GET /api/production/suggestion returns suggestion and grandTotalValue", async () => {
  const res = await request(app).get("/api/production/suggestion");

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("suggestion");
  expect(res.body).toHaveProperty("grandTotalValue");

  // se houver itens, valida estrutura
  if (Array.isArray(res.body.suggestion) && res.body.suggestion.length > 0) {
    expect(res.body.suggestion[0]).toHaveProperty("suggestedQuantity");
  }
});