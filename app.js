// server/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectDB = require('./util/db'); // your existing db connector
const ensureAdmin = require('./boot/ensureAdmin');
const employeeRoute = require('./router/employee-route');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors());

// connect DB then ensure single admin
connectDB();
ensureAdmin().catch(console.error);

// routes
app.use('/api/auth', require('./router/auth-route'));
app.use('/api/employee', require('./router/employee-route'));

// health
app.get('/api/health', (_, res) => res.json({ ok: true }));

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;
