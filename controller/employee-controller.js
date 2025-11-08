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

exports.AddEmployee = async (req, res) => {
  try {
    const { name, role, wagePerDay, unit, active } = req.body;
    if (!name || !role || wagePerDay == null || !unit)
      return res.status(400).json({ msg: "Required fields: name, role, wagePerDay, unit" });

    // normalize like mongoose pre-save
    const normalizedName = String(name).trim().toUpperCase();

    // check first BEFORE saving
    const existing = await Employee.findOne({ name: normalizedName });
    if (existing) {
      return res.status(409).json({ msg: "Employee full name must be unique" });
    }

    const emp = new Employee({
      name: normalizedName, // now explicitly saving uppercase
      role: String(role).trim(),
      wagePerDay: Number(wagePerDay),
      unit: String(unit).trim(),
      active: active !== undefined ? !!active : true,
    });

    const saved = await emp.save();
    return res.status(201).json({ msg: "Employee added successfully", data: saved });

  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.name) {
      return res.status(409).json({ msg: "Employee full name must be unique" });
    }
    if (error?.name === "ValidationError") {
      const errs = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ msg: "Validation failed", errors: errs });
    }
    console.error("Error adding employee:", error);
    return res.status(500).json({ msg: "Server error while adding employee" });
  }
};
