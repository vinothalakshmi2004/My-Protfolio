const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const resources = require('../config/resources');
const SiteSettings = require('../models/SiteSettings');
const Message = require('../models/Message');
const { listAllFiles } = require('../config/gridfs');

/**
 * @desc    Overview numbers for the dashboard home: counts per resource,
 *          unread messages, latest content change and the 5 newest messages.
 * @route   GET /api/admin/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const counts = {};
  const lastUpdates = [];

  await Promise.all(
    resources.map(async ({ key, Model }) => {
      const [total, visible, latest] = await Promise.all([
        Model.countDocuments({}),
        Model.countDocuments({ visible: { $ne: false } }),
        Model.findOne({}).sort({ updatedAt: -1 }).select('updatedAt').lean(),
      ]);
      counts[key] = { total, visible };
      if (latest?.updatedAt) lastUpdates.push(latest.updatedAt);
    })
  );

  const [settings, unreadMessages, totalMessages, recentMessages, files] = await Promise.all([
    SiteSettings.findOne({}).select('updatedAt').lean(),
    Message.countDocuments({ isRead: false }),
    Message.countDocuments({}),
    Message.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    listAllFiles(),
  ]);
  if (settings?.updatedAt) lastUpdates.push(settings.updatedAt);

  const lastUpdated = lastUpdates.length ? new Date(Math.max(...lastUpdates.map((d) => new Date(d).getTime()))) : null;

  return successResponse(res, {
    counts,
    messages: { total: totalMessages, unread: unreadMessages },
    storage: { files: files.length, bytes: files.reduce((sum, f) => sum + (f.length || 0), 0) },
    lastUpdated,
    recentMessages,
  });
});

module.exports = { getStats };
