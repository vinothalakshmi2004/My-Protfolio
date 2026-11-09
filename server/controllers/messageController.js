const { matchedData } = require('express-validator');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendContactNotification } = require('../utils/sendEmail');

/**
 * @desc    Public contact form submission (rate-limited; e-mail notification is best-effort)
 * @route   POST /api/contact
 * @access  Public
 */
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message, website } = matchedData(req, { locations: ['body'] });
  const thanks = 'Thank you for reaching out! Your message has been received.';

  // Honeypot filled -> almost certainly a bot. Pretend success, store nothing.
  if (website) return successResponse(res, { id: null }, thanks, 201);

  const saved = await Message.create({ name, email, subject, message });
  sendContactNotification({ name, email, subject, message }).catch((err) =>
    console.error('[Contact] Notification failed:', err.message)
  );

  return successResponse(res, { id: saved._id, createdAt: saved.createdAt }, thanks, 201);
});

/**
 * @desc    Inbox. Optional ?status=unread|read
 * @route   GET /api/messages
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'unread') filter.isRead = false;
  if (req.query.status === 'read') filter.isRead = true;

  const [messages, unread, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).limit(500),
    Message.countDocuments({ isRead: false }),
    Message.countDocuments({}),
  ]);
  return successResponse(res, messages, 'Messages retrieved', 200, { total, unread });
});

/**
 * @desc    Number of unread messages (sidebar badge / overview card)
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const unread = await Message.countDocuments({ isRead: false });
  return successResponse(res, { unread }, 'Unread count retrieved');
});

/**
 * @desc    Single message
 * @route   GET /api/messages/:id
 * @access  Private
 */
const getMessageById = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return errorResponse(res, 'Message not found', 404);
  return successResponse(res, message, 'Message retrieved');
});

/**
 * @desc    Mark read (default) or unread with body { isRead: false }
 * @route   PATCH /api/messages/:id/read
 * @access  Private
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
  const isRead = req.body?.isRead === undefined ? true : req.body.isRead === true || req.body.isRead === 'true';
  const message = await Message.findByIdAndUpdate(req.params.id, { isRead }, { new: true });
  if (!message) return errorResponse(res, 'Message not found', 404);
  return successResponse(res, message, `Message marked as ${isRead ? 'read' : 'unread'}`);
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return errorResponse(res, 'Message not found', 404);
  return successResponse(res, { id: req.params.id }, 'Message deleted');
});

module.exports = {
  submitContactMessage,
  getMessages,
  getUnreadCount,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
};
