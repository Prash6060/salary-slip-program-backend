// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.split(' ')[1];
    const cookieToken = req.cookies?.token;
    const token = bearer || cookieToken;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, adminId: payload.adminId };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
