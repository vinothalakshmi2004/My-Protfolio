const express = require('express');
const { login, getMe, changePassword, changeEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const { loginLimiter, sensitiveAuthLimiter } = require('../middleware/rateLimiterMiddleware');
const validators = require('../validators');

const router = express.Router();

router.post('/login', loginLimiter, rules(validators.login()), login); // 5 failed attempts / 15 min
router.get('/me', protect, getMe);
router.post('/change-password', protect, sensitiveAuthLimiter, rules(validators.changePassword()), changePassword);
router.post('/change-email', protect, sensitiveAuthLimiter, rules(validators.changeEmail()), changeEmail);

module.exports = router;
