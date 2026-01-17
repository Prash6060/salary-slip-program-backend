const Payslip = require("../model/Payslip");
const Advance = require("../model/Advance");
const Employee = require("../model/Employee");

exports.AddPaySlip = async (req, res) => {
  try {
    const {
      employeeName,
      employeeCode,
      workingUnit,
      month, // YYYY-MM
      daysPresent,
      wagePerDay,
      salaryPayout,
      hasAdvance,
      pendingAdvance,
      setOffAdvance,
      generatedAt,
    } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (
      !employeeName ||
      !employeeCode ||
      !workingUnit ||
      !month ||
      daysPresent === undefined ||
      wagePerDay === undefined ||
      salaryPayout === undefined ||
      !generatedAt
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        msg: "Invalid month format. Use YYYY-MM.",
      });
    }

    const days = Number(daysPresent);
    const wage = Number(wagePerDay);
    const payout = Number(salaryPayout);

    if ([days, wage, payout].some(Number.isNaN) || days < 0 || wage < 0 || payout < 0) {
      return res.status(400).json({ msg: "Invalid numeric values" });
    }

    if (days * wage !== payout) {
      return res.status(400).json({ msg: "Salary payout mismatch" });
    }

    /* ---------------- ADVANCE LOGIC ---------------- */
    const hasAdv = hasAdvance === true || hasAdvance === "true";

    let pending = null;
    let setOff = 0;
    let finalPay = payout;

    if (hasAdv) {
      pending = Number(pendingAdvance ?? 0);
      setOff = Number(setOffAdvance ?? 0);

      if ([pending, setOff].some(Number.isNaN) || pending < 0 || setOff < 0) {
        return res.status(400).json({ msg: "Invalid advance values" });
      }

      if (setOff > pending) {
        return res.status(400).json({
          msg: "Set-off advance cannot exceed pending advance",
        });
      }

      finalPay = payout - setOff;
      if (finalPay < 0) {
        return res.status(400).json({ msg: "Final payout cannot be negative" });
      }
    }

    /* ---------------- CREATE PAYSLIP ---------------- */
    const slip = new Payslip({
      employeeName,
      employeeCode,
      workingUnit,
      month,
      daysPresent: days,
      wagePerDay: wage,
      salaryPayout: payout,
      hasAdvance: hasAdv,
      pendingAdvance: hasAdv ? pending : null,
      setOffAdvance: hasAdv ? setOff : null,
      finalPayout: finalPay,
      generatedAt,
    });

    const savedSlip = await slip.save();

    /* ---------------- HANDLE SET-OFF ADVANCE ---------------- */
    if (hasAdv && setOff > 0) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();

      const advanceEntry = new Advance({
        employeeName,
        employeeCode,
        unit: workingUnit,
        advanceDate: `${dd}-${mm}-${yyyy}`,
        advanceAmount: -setOff,
        approvedBy: `Payslip ${month}`,
        generatedAt: new Date().toLocaleString(),
      });

      await advanceEntry.save();

      /* UPDATE EMPLOYEE activeAdvance FLAG */
      const aggregate = await Advance.aggregate([
        { $match: { employeeCode } },
        {
          $group: {
            _id: "$employeeCode",
            totalAdvance: { $sum: "$advanceAmount" },
          },
        },
      ]);

      const totalAdvance = aggregate[0]?.totalAdvance || 0;

      await Employee.updateOne(
        { employeeCode },
        { $set: { activeAdvance: totalAdvance > 0 } }
      );
    }

    res.status(201).json({
      msg: "Payslip generated successfully",
      data: savedSlip,
    });

  } catch (err) {
    /* DETAILED 11000 ERROR HANDLING */
    if (err.code === 11000) {
      const key = Object.keys(err.keyPattern)[0];
      if (key === "employeeCode") {
        return res.status(409).json({
          msg: "Payslip already exists for this employee and month",
        });
      } else if (key === "payslipCode") {
        return res.status(500).json({
          msg: "Payslip code collision, please try again",
        });
      }
    }

    console.error("AddPaySlip error:", err);
    res.status(500).json({
      msg: "Failed to generate payslip",
      error: err.message,
    });
  }
};
