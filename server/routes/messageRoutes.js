const express = require('express');
const {
  getMessages,
  getUnreadCount,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { rules } = require('../middleware/validationMiddleware');
const validators = require('../validators');

const router = express.Router();
router.use(protect); // every inbox route is admin-only

router.get('/', getMessages);
router.get('/unread-count', getUnreadCount); // declared before /:id
router.get('/:id', rules(validators.idParam()), getMessageById);
router.patch('/:id/read', rules(validators.idParam()), markMessageAsRead);
router.delete('/:id', rules(validators.idParam()), deleteMessage);

module.exports = router;
