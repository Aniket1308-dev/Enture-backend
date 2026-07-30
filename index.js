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

app.use(cors());          // middleware first
app.use(express.json()); // if not already there — needed to parse req.body

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);  // routes mounted last

app.get('/', (req, res) => {
  res.send('Enture backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});