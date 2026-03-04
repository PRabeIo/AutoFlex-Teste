function floorDiv(stock, required) {
  const s = Number(stock);
  const r = Number(required);
  if (!(r > 0)) return 0;
  return Math.floor(s / r);
}

/**
 * products: [{ id, code, name, price, bom: [{ rawMaterialId, requiredQuantity }] }]
 * stock: Map(rawMaterialId -> stockQuantity)
 */
function planProduction(products, stock) {
  const available = new Map(stock);
  const suggestion = [];
  let grandTotalValue = 0;

  const sorted = [...products].sort(
    (a, b) => Number(b.price) - Number(a.price) || a.id - b.id
  );

  for (const p of sorted) {
    if (!p.bom || p.bom.length === 0) continue;

    let maxUnits = Infinity;
    for (const item of p.bom) {
      const rmId = Number(item.rawMaterialId);
      const possible = floorDiv(available.get(rmId) ?? 0, item.requiredQuantity);
      maxUnits = Math.min(maxUnits, possible);
      if (maxUnits === 0) break;
    }

    if (!Number.isFinite(maxUnits) || maxUnits <= 0) continue;

    for (const item of p.bom) {
      const rmId = Number(item.rawMaterialId);
      const req = Number(item.requiredQuantity);
      available.set(rmId, (available.get(rmId) ?? 0) - maxUnits * req);
    }

    const totalValue = Number(p.price) * maxUnits;
    grandTotalValue += totalValue;

    suggestion.push({
      productId: p.id,
      code: p.code,
      name: p.name,
      unitPrice: p.price,        
      suggestedQuantity: maxUnits,
      totalValue,
    });
  }

  return { suggestion, grandTotalValue };
}

module.exports = { planProduction };