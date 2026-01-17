// controller/slip-controller.js
const Payslip = require("../model/Payslip");

exports.AddPaySlip = async (req, res) => {
  try {
    const {
      employeeName,
      employeeCode,
      monthYear,     // now single field MM-YYYY
      workingUnit,
      daysPresent,
      wagePerDay,
      hasAdvance,
      advanceAmount,
      totalPay,
      generatedAt,
    } = req.body;

    // Basic validation
    if (
      !employeeName ||
      !employeeCode ||
      !monthYear ||
      !workingUnit ||
      daysPresent === undefined ||
      wagePerDay === undefined ||
      totalPay === undefined ||
      !generatedAt
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Validate monthYear format MM-YYYY
    if (!/^(0[1-9]|1[0-2])-(\d{4})$/.test(monthYear)) {
      return res.status(400).json({
        msg: "Invalid monthYear format. Use MM-YYYY.",
      });
    }

    // Create new Payslip
    const slip = new Payslip({
      employeeName,
      employeeCode,
      monthYear,
      workingUnit,
      daysPresent: Number(daysPresent),
      wagePerDay: Number(wagePerDay),
      hasAdvance: Boolean(hasAdvance),
      advanceAmount: hasAdvance ? Number(advanceAmount) || 0 : 0,
      totalPay: Number(totalPay),
      generatedAt,
    });

    const savedSlip = await slip.save();

    res.status(201).json({
      msg: "Payslip generated successfully",
      data: savedSlip,
    });
  } catch (err) {
    // Duplicate payslip for same employee + monthYear
    if (err.code === 11000) {
      return res.status(409).json({
        msg: "Payslip already exists for this employee and monthYear",
      });
    }

    console.error("AddPaySlip error:", err);
    res.status(500).json({
      msg: "Failed to generate payslip",
      error: err.message,
    });
  }
};
