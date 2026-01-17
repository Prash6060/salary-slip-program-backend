const express = require("express");
const router = express.Router();
const { AddAdvance, ListAdvance } = require("../controller/advance-controller");

router.post("/add-advance",AddAdvance);
router.get("/list-advance",ListAdvance)

module.exports = router;