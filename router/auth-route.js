// server/src/routes/auth-route.js
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, me } = require('../controller/auth-controller');
const auth = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 60_000, max: 20 }); // 20 req/min per IP

router.post('/login', limiter, login);
router.get('/me', auth, me);

module.exports = router;
