const router = require("express").Router();

router.use("/products", require("./product.routes"));
router.use("/raw-materials", require("./rawMaterial.routes"));
router.use("/production", require("./production.routes"));

module.exports = router;