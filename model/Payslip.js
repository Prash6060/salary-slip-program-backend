const mongoose = require("mongoose");
const { Schema } = mongoose;

const PayslipSchema = new Schema(
  {
    payslipCode: { type: String, unique: true }, // PS1, PS2...

    employeeName: { type: String, required: true, trim: true },
    employeeCode: { type: String, required: true, trim: true }, // NOW REQUIRED

    monthYear: {
      type: String, // format: "MM-YYYY"
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Validate MM-YYYY format
          return /^(0[1-9]|1[0-2])-(\d{4})$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid monthYear! Use MM-YYYY format.`,
      },
    },

    workingUnit: { type: String, required: true, trim: true },

    daysPresent: { type: Number, required: true, min: 0 },
    wagePerDay: { type: Number, required: true, min: 0 },

    hasAdvance: { type: Boolean, default: false },
    advanceAmount: { type: Number, default: 0, min: 0 },

    totalPay: { type: Number, required: true, min: 0 },

    generatedAt: { type: String, required: true }, // frontend timestamp
  },
  { timestamps: true }
);

// Normalize employee name
PayslipSchema.pre("save", function (next) {
  if (this.employeeName) {
    this.employeeName = this.employeeName.toUpperCase().trim();
  }
  next();
});

// Generate payslipCode (PS1, PS2...)
PayslipSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) return next();

    const Payslip = mongoose.model("Payslip");
    const count = await Payslip.countDocuments({});

    this.payslipCode = `PS${count + 1}`;

    next();
  } catch (err) {
    next(err);
  }
});

// Prevent duplicate payslip for same employee + monthYear
PayslipSchema.index(
  { employeeName: 1, monthYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("Payslip", PayslipSchema);
