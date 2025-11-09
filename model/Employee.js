// models/employee.js
const mongoose = require('mongoose');
const { getNextGlobalSequence, formatCode } = require('../util/Sequence');

const EmployeeSchema = new mongoose.Schema({
  employeeCode: { type: String, trim: true, unique: true },   // updated name from code -> employeeCode
  name: { type: String, required: true, trim: true }, // normalized to uppercase
  role: { type: String, required: true, trim: true },
  wagePerDay: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  joiningDate: { type: String, required: true, trim: true }, // dd/mm/yyyy format string
  activeAdvance: { type: Boolean, default: false }, // NEW field default false
  active: { type: Boolean, default: true },
}, { timestamps: true });

// normalize name -> UPPERCASE before save
EmployeeSchema.pre('save', function(next) {
  if (this.isModified('name') && this.name) {
    this.name = this.name.toUpperCase().trim();
  }
  next();
});

// unique index on normalized name
EmployeeSchema.index({ name: 1 }, { unique: true });

// code generator (shared counter example)
EmployeeSchema.pre('save', async function(next) {
  try {
    if (this.employeeCode) return next();
    const seq = await getNextGlobalSequence('global_code');
    this.employeeCode = formatCode('E', seq, 3);
    next();
  } catch (err) { next(err); }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
