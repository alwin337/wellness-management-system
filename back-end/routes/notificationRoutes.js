const express = require("express");

const router =
  express.Router();

const {
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require(
  "../controllers/notificationController"
);

const {
  protect,
} = require(
  "../middleware/authMiddleware"
);


// Get all notifications
router.get(
  "/",
  protect,
  getMyNotifications
);


// Get unread notifications
router.get(
  "/unread",
  protect,
  getUnreadNotifications
);


// Get unread count
router.get(
  "/unread/count",
  protect,
  getUnreadCount
);


// Mark all as read
router.patch(
  "/read-all",
  protect,
  markAllAsRead
);


// Mark one as read
router.patch(
  "/:id/read",
  protect,
  markAsRead
);


// Delete notification
router.delete(
  "/:id",
  protect,
  deleteNotification
);


module.exports = router;