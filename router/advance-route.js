const express = require("express");
const router = express.Router();
const { AddAdvance } = require("../controller/advance-controller");

router.post("/add-advance",AddAdvance);

module.exports = router;