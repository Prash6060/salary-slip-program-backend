// server/src/models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  adminId: { type: String, unique: true, required: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

AdminSchema.index({ adminId: 1 }, { unique: true });

module.exports = mongoose.model('Admin', AdminSchema);
