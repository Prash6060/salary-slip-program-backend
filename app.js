// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./util/db');

const app = express();

// connect database first
connectDB();

// middlewares
app.use(express.json()); // so you can parse JSON body later

// routes
app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

// port (never hardcode)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
