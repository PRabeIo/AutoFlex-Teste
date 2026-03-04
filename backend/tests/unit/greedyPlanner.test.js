const { planProduction } = require("../../src/services/greedyPlanner");

test("planProduction prioritizes higher price and consumes stock", () => {
  const products = [
    {
      id: 1,
      code: "P000000001",
      name: "High",
      price: 100,
      bom: [{ rawMaterialId: 1, requiredQuantity: 5 }],
    },
    {
      id: 2,
      code: "P000000002",
      name: "Low",
      price: 10,
      bom: [{ rawMaterialId: 1, requiredQuantity: 2 }],
    },
  ];

  const stock = new Map([[1, 10]]); // RM1=10

  const result = planProduction(products, stock);

  // Produto High: floor(10/5)=2 unidades, consome tudo
  expect(result.suggestion).toHaveLength(1);
  expect(result.suggestion[0]).toMatchObject({
    productId: 1,
    code: "P000000001",
    suggestedQuantity: 2,
    totalValue: 200,
  });
  expect(result.grandTotalValue).toBe(200);
});