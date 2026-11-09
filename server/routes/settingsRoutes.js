const express = require('express');
const { getPublicSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const validators = require('../validators');

const router = express.Router();

router.get('/', getPublicSettings); // public (phone hidden unless showPhonePublicly)
router.put('/', protect, rules(validators.settings()), updateSettings); // admin, partial update

module.exports = router;
