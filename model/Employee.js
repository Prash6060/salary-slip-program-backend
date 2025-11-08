// models/employee.js
const mongoose = require('mongoose');
const { getNextGlobalSequence, formatCode } = require('../util/Sequence');

const EmployeeSchema = new mongoose.Schema({
  code: { type: String, trim: true, unique: true },
  name: { type: String, required: true, trim: true },  // we'll normalize this
  role: { type: String, required: true, trim: true },
  wagePerDay: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
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

// your code generator (shared counter example)
EmployeeSchema.pre('save', async function(next) {
  try {
    if (this.code) return next();
    const seq = await getNextGlobalSequence('global_code');
    this.code = formatCode('E', seq, 3);
    next();
  } catch (err) { next(err); }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
