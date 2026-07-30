const express = require('express');
const router = express.Router();
const { register, login , resetUserPassword} = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');


router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

router.patch('/reset-password/:userId', authenticateToken, resetUserPassword);

module.exports = router;