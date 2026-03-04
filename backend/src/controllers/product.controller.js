const productService = require("../services/product.service");
const asyncHandler = require("../utils/asyncHandler");

function toIntId(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
  }
  return n;
}

const list = asyncHandler(async (req, res) => {
  res.json(await productService.list());
});

const getById = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const data = await productService.getById(id);
  if (!data) return res.status(404).json({ error: "Product not found" });
  res.json(data);
});

const create = asyncHandler(async (req, res) => {
  const { code, name, price } = req.body;
  const created = await productService.create({ code, name, price });
  res.status(201).json(created);
});

const update = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const { code, name, price } = req.body;

  const updated = await productService.update(id, { code, name, price });
  if (!updated) return res.status(404).json({ error: "Product not found" });

  res.json(updated);
});

const remove = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const ok = await productService.remove(id);
  if (!ok) return res.status(404).json({ error: "Product not found" });
  res.status(204).send();
});

// BOM
const listMaterials = asyncHandler(async (req, res) => {
  const productId = toIntId(req.params.productId, "productId");
  res.json(await productService.listMaterials(productId));
});

const addMaterial = asyncHandler(async (req, res) => {
  const productId = toIntId(req.params.productId, "productId");
  const { rawMaterialId, requiredQuantity } = req.body;

  const created = await productService.addMaterial(productId, {
    rawMaterialId,
    requiredQuantity,
  });

  res.status(201).json(created);
});

const updateMaterial = asyncHandler(async (req, res) => {
  const productId = toIntId(req.params.productId, "productId");
  const itemId = toIntId(req.params.itemId, "itemId");
  const { requiredQuantity } = req.body;

  const updated = await productService.updateMaterial(productId, itemId, {
    requiredQuantity,
  });

  if (!updated) return res.status(404).json({ error: "BOM item not found" });
  res.json(updated);
});

const removeMaterial = asyncHandler(async (req, res) => {
  const productId = toIntId(req.params.productId, "productId");
  const itemId = toIntId(req.params.itemId, "itemId");

  const ok = await productService.removeMaterial(productId, itemId);
  if (!ok) return res.status(404).json({ error: "BOM item not found" });

  res.status(204).send();
});

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