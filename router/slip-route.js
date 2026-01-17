const express = require("express");
const router = express.Router();
const {AddPaySlip} = require("../controller/slip-controller");

router.post("/add-slip",AddPaySlip);

module.exports = router;