const router = require("express").Router();
const productController = require("../controllers/product.controller");


// CRUD product
router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

// BOM dentro do produto (RF003 / RF007)
router.get("/:productId/materials", productController.listMaterials);
router.post("/:productId/materials", productController.addMaterial);
router.put("/:productId/materials/:itemId", productController.updateMaterial);
router.delete("/:productId/materials/:itemId", productController.removeMaterial);

module.exports = router;