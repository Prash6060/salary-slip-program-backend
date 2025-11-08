// server/src/boot/ensureAdmin.js
const bcrypt = require('bcryptjs');
const Admin = require('../model/Admin');

module.exports = async function ensureAdmin() {
  const adminId = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminId || !adminPassword) {
    console.warn('⚠️  ADMIN_ID / ADMIN_PASSWORD not set — skipping admin bootstrap');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const existing = await Admin.findOne({ adminId });

  if (!existing) {
    await Admin.create({ adminId, passwordHash });
    console.log(`✅ Admin created: ${adminId}`);
  } else {
    // keep admin single; update password if changed
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`✅ Admin ensured/updated: ${adminId}`);
  }

  // OPTIONAL: lock to exactly 1 admin doc
  await Admin.deleteMany({ adminId: { $ne: adminId } });
};
