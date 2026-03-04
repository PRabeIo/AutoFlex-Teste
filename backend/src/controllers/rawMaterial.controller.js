const rawMaterialService = require("../services/rawMaterial.service");
const asyncHandler = require("../utils/asyncHandler");

function toIntId(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
  }
  return n;
}

const list = asyncHandler(async (req, res) => {
  res.json(await rawMaterialService.list());
});

const getById = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const data = await rawMaterialService.getById(id);
  if (!data) return res.status(404).json({ error: "Raw material not found" });
  res.json(data);
});

const create = asyncHandler(async (req, res) => {
  const { code, name, stockQuantity } = req.body;
  const created = await rawMaterialService.create({ code, name, stockQuantity });
  res.status(201).json(created);
});

const update = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const { code, name, stockQuantity } = req.body;

  const updated = await rawMaterialService.update(id, { code, name, stockQuantity });
  if (!updated) return res.status(404).json({ error: "Raw material not found" });

  res.json(updated);
});

const remove = asyncHandler(async (req, res) => {
  const id = toIntId(req.params.id, "id");
  const ok = await rawMaterialService.remove(id);
  if (!ok) return res.status(404).json({ error: "Raw material not found" });
  res.status(204).send();
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};