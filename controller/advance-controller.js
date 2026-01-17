// controller/advance-controller.js
const Advance = require("../model/Advance");
const Employee = require("../model/Employee"); // make sure you have this model

exports.AddAdvance = async (req, res) => {
  try {
    const {
      employeeName,
      employeeCode,
      unit,
      advanceDate,
      advanceAmount,
      approvedBy,
    } = req.body;

    // Basic validation
    if (
      !employeeName ||
      !employeeCode ||
      !unit ||
      !advanceDate ||
      advanceAmount === undefined ||
      !approvedBy
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Create new advance object
    const newAdvance = new Advance({
      employeeName,
      employeeCode,
      unit,
      advanceDate,
      advanceAmount: Number(advanceAmount),
      approvedBy,
      generatedAt: new Date().toLocaleString(),
    });

    // Save to DB
    const savedAdvance = await newAdvance.save();

    // Update employee's activeAdvance field to true
    const employee = await Employee.findOne({ employeeCode });
    if (employee) {
      employee.activeAdvance = true;
      await employee.save();
    }

    res.status(201).json({
      msg: "Advance added successfully and employee marked activeAdvance",
      data: savedAdvance,
    });
  } catch (err) {
    // Handle duplicate advanceCode or validation errors
    if (err.code === 11000) {
      return res.status(409).json({
        msg: "Duplicate entry detected. Please check the advanceCode or employee/date combination.",
      });
    }

    console.error("AddAdvance error:", err);
    res.status(500).json({
      msg: "Failed to add advance",
      error: err.message,
    });
  }
};
