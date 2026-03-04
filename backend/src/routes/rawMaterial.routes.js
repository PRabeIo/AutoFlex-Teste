const router = require("express").Router();
const rawMaterialController = require("../controllers/rawMaterial.controller");

router.get("/", rawMaterialController.list);
router.get("/:id", rawMaterialController.getById);
router.post("/", rawMaterialController.create);
router.put("/:id", rawMaterialController.update);
router.delete("/:id", rawMaterialController.remove);

module.exports = router;