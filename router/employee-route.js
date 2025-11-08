const express = require("express");
const router = express.Router();
const { ListEmployee, AddEmployee } = require("../controller/employee-controller");

router.get("/list-employee", ListEmployee);
router.post("/add-employee",AddEmployee);

module.exports = router;
