const mongoose = require("mongoose");
const { Schema } = mongoose;

const PayslipSchema = new Schema(
  {
    payslipCode: {
      type: String,
      unique: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    employeeCode: {
      type: String,
      required: true,
      trim: true,
    },

    month: {
      type: String, // YYYY-MM
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid month format. Use YYYY-MM.`,
      },
    },

    workingUnit: {
      type: String,
      required: true,
      trim: true,
    },

    daysPresent: {
      type: Number,
      required: true,
      min: 0,
    },

    wagePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    salaryPayout: {
      type: Number,
      required: true,
      min: 0,
    },

    hasAdvance: {
      type: Boolean,
      default: false,
    },

    pendingAdvance: {
      type: Number,
      default: null,
      min: 0,
    },

    setOffAdvance: {
      type: Number,
      default: null,
      min: 0,
    },

    finalPayout: {
      type: Number,
      required: true,
      min: 0,
    },

    generatedAt: {
      type: String,
      required: true, // frontend timestamp
    },
  },
  { timestamps: true }
);

/* ---------------- NORMALIZE EMPLOYEE NAME & CODE ---------------- */
PayslipSchema.pre("save", function (next) {
  if (this.employeeName) this.employeeName = this.employeeName.toUpperCase().trim();
  if (this.employeeCode) this.employeeCode = this.employeeCode.toUpperCase().trim();

  // GENERATE payslipCode if not already set
  if (!this.payslipCode) {
    // Synchronous timestamp-based code (safe)
    this.payslipCode = `PS-${Date.now()}`; // e.g., PS-1671234567890
  }

  next();
});

/* ---------------- UNIQUE PAYSLIP PER EMPLOYEE + MONTH ---------------- */
PayslipSchema.index({ employeeCode: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", PayslipSchema);
