const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('DB connected, server time:', res.rows[0].now);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Enture backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});