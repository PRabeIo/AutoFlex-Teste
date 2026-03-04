const router = require("express").Router();
const productionController = require("../controllers/production.controller");

router.get("/suggestion", productionController.suggestion);

module.exports = router;