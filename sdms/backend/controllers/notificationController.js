const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, isRead } = req.query;
  const query = {
    $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }, { recipientRole: 'all' }],
  };
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const { data, meta } = await paginate(Notification, query, {
    page,
    limit: limit || 20,
    sort: '-createdAt',
    populate: ['relatedStudent'],
  });

  const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

  return sendSuccess(res, 200, 'Notifications fetched', data, { ...meta, unreadCount });
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  return sendSuccess(res, 201, 'Notification created', notification);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  return sendSuccess(res, 200, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }, { recipientRole: 'all' }] },
    { isRead: true }
  );
  return sendSuccess(res, 200, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  await notification.deleteOne();
  return sendSuccess(res, 200, 'Notification deleted');
});

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification };
