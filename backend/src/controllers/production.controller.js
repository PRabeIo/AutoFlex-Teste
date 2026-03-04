const productionService = require("../services/productionSuggestion.service");
const asyncHandler = require("../utils/asyncHandler");

const suggestion = asyncHandler(async (req, res) => {
  res.json(await productionService.calculateSuggestion());
});

module.exports = { suggestion };