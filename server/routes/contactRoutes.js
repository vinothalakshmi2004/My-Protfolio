const express = require('express');
const { submitContactMessage } = require('../controllers/messageController');
const { contactLimiter } = require('../middleware/rateLimiterMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const validators = require('../validators');

const router = express.Router();

// POST /api/contact — public contact form (5 per 15 min per IP, honeypot protected)
router.post('/', contactLimiter, rules(validators.contact()), submitContactMessage);

module.exports = router;
