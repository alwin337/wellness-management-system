const mongoose = require("mongoose");

const Notification =
  require("../models/notification");


// Get my notifications
const getMyNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId: req.user._id,
        }).sort({
          createdAt: -1,
        });

      const unreadCount =
        await Notification.countDocuments({
          userId: req.user._id,
          isRead: false,
        });

      res.status(200).json({
        count:
          notifications.length,

        unreadCount,

        notifications,
      });

    } catch (error) {
      console.error(
        "GET NOTIFICATIONS ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error fetching notifications",

        error:
          error.message,
      });
    }
  };


// Get unread notifications
const getUnreadNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          userId: req.user._id,

          isRead: false,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        count:
          notifications.length,

        notifications,
      });

    } catch (error) {
      console.error(
        "GET UNREAD NOTIFICATIONS ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error fetching unread notifications",

        error:
          error.message,
      });
    }
  };


// Mark one notification as read
const markAsRead =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      const notification =
        await Notification.findOne({
          _id: id,

          userId:
            req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      notification.isRead = true;

      await notification.save();

      res.status(200).json({
        message:
          "Notification marked as read",

        notification,
      });

    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error marking notification as read",

        error:
          error.message,
      });
    }
  };


// Mark all notifications as read
const markAllAsRead =
  async (req, res) => {
    try {
      const result =
        await Notification.updateMany(
          {
            userId:
              req.user._id,

            isRead: false,
          },
          {
            $set: {
              isRead: true,
            },
          }
        );

      res.status(200).json({
        message:
          "All notifications marked as read",

        modifiedCount:
          result.modifiedCount,
      });

    } catch (error) {
      console.error(
        "MARK ALL READ ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error marking notifications as read",

        error:
          error.message,
      });
    }
  };


// Delete notification
const deleteNotification =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      const notification =
        await Notification.findOneAndDelete({
          _id: id,

          userId:
            req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      res.status(200).json({
        message:
          "Notification deleted successfully",
      });

    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error deleting notification",

        error:
          error.message,
      });
    }
  };


// Get unread count
const getUnreadCount =
  async (req, res) => {
    try {
      const count =
        await Notification.countDocuments({
          userId:
            req.user._id,

          isRead: false,
        });

      res.status(200).json({
        unreadCount:
          count,
      });

    } catch (error) {
      console.error(
        "GET UNREAD COUNT ERROR:",
        error.message
      );

      res.status(500).json({
        message:
          "Error fetching unread count",

        error:
          error.message,
      });
    }
  };


module.exports = {
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};