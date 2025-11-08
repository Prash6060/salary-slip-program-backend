// server/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

exports.login = async (req, res, next) => {
  try {
    const { adminId, adminPassword } = req.body;
    if (!adminId || !adminPassword) return res.status(400).json({ message: 'adminId and adminPassword are required' });

    const admin = await Admin.findOne({ adminId });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(adminPassword, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: admin._id.toString(), role: 'admin', adminId });

    // send as cookie (httpOnly) + JSON (client can choose)
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ token, adminId });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  // req.user injected by auth middleware
  res.json({ adminId: req.user.adminId, role: 'admin' });
};
