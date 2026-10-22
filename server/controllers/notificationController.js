import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get the latest 30 notifications for the authenticated user and count unread
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.status(200).json({
    notifications,
    unreadCount,
  });
});

// Mark a single notification as read (must belong to authenticated user)
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    message: 'Notification marked as read',
    notification,
  });
});

// Mark all unread notifications for authenticated user as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount,
  });
});
