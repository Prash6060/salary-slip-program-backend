// models/Advance.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdvanceSchema = new Schema(
  {
    advanceCode: { type: String, unique: true, trim: true }, // AD1, AD2, ...

    employeeName: { type: String, required: true, trim: true },
    employeeCode: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    advanceDate: {
      type: String, // dd-mm-yyyy
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Basic regex to match dd-mm-yyyy
          return /^\d{2}-\d{2}-\d{4}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid date format. Use dd-mm-yyyy.`,
      },
    },
    advanceAmount: { type: Number, required: true, min: 0 },
    approvedBy: {
      type: String,
      required: true,
      enum: ["Mahendra Gulechha", "Rajendra Gulechha", "Vinod Gulechha"],
    },
    generatedAt: { type: String, required: true }, // timestamp from frontend
  },
  { timestamps: true }
);

// Normalize employee name before saving
AdvanceSchema.pre("save", function (next) {
  if (this.employeeName) this.employeeName = this.employeeName.toUpperCase().trim();
  next();
});

// Generate advanceCode automatically (AD1, AD2, AD3...)
AdvanceSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) return next();

    const Advance = mongoose.model("Advance");
    const count = await Advance.countDocuments({});

    this.advanceCode = `AD${count + 1}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Advance", AdvanceSchema);
