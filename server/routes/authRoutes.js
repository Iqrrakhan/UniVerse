const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, refreshAccessToken, logoutUser, getMe, verifyEmail, verifyBusiness } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../lib/schemas');

// Rate limiter for auth endpoints: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.post('/verify-email', protect, verifyEmail);
router.post('/verify-business', protect, verifyBusiness);

module.exports = router;