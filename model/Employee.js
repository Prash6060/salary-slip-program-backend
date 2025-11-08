const mongoose = require('mongoose');
const { getNextGlobalSequence, formatCode } = require('../util/Sequence');

const EmployeeSchema = new mongoose.Schema({
  code: { type: String, trim: true, unique: true },   // E001, E004, ...
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  wagePerDay: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

EmployeeSchema.pre('save', async function(next) {
  try {
    if (this.code) return next();
    const seq = await getNextGlobalSequence('global_code'); // shared!
    this.code = formatCode('E', seq, 3); // E###
    next();
  } catch (err) { next(err); }
})

EmployeeSchema.index({ name: 1, role: 1, unit: 1 });
module.exports = mongoose.model('Employee', EmployeeSchema);
