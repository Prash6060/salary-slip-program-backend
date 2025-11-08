const Employee = require("../model/Employee");

exports.ListEmployee = async (req, res) => {
  try {
    const employees = await Employee.find();

    if (!employees.length) {
      return res.status(404).json({ msg: "No employees found" });
    }

    return res.status(200).json({ data: employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({ msg: "Server error while fetching employees" });
  }
};

// POST /api/employee/add-employee
exports.AddEmployee = async (req, res) => {
  try {
    const { name, role, wagePerDay, unit, code, active } = req.body;

    // Basic required-field checks (Mongoose will also validate)
    if (!name || !role || wagePerDay === undefined || wagePerDay === null || !unit) {
      return res.status(400).json({ msg: "Required fields: name, role, wagePerDay, unit" });
    }
    if (Number.isNaN(Number(wagePerDay)) || Number(wagePerDay) < 0) {
      return res.status(400).json({ msg: "wagePerDay must be a non-negative number" });
    }

    // Create doc; model pre-save hook will assign code if not provided
    const emp = new Employee({
      name: String(name).trim(),
      role: String(role).trim(),
      wagePerDay: Number(wagePerDay),
      unit: String(unit).trim(),
      // optional:
      code: code?.trim(),                 // if omitted, pre('save') generates E### 
      active: active !== undefined ? !!active : true,
    });

    const saved = await emp.save();
    return res.status(201).json({ msg: "Employee added successfully", data: saved });
  } catch (error) {
    // Handle duplicate key errors nicely (e.g., unique code)
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "unique field";
      return res.status(409).json({ msg: `Duplicate value for ${field}` });
    }

    // Mongoose validation errors
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ msg: "Validation failed", errors: messages });
    }

    console.error("Error adding employee:", error);
    return res.status(500).json({ msg: "Server error while adding employee" });
  }
};
