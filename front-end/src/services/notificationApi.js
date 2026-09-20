import API from "../api/axios";

/**
 * Fetch all notifications for the currently authenticated user.
 * Backend returns: { count, unreadCount, notifications }
 */
export const getMyNotifications = () => {
  return API.get("/notifications");
};

/**
 * Fetch unread notifications for the currently authenticated user.
 * Backend returns: { count, notifications }
 */
export const getUnreadNotifications = () => {
  return API.get("/notifications/unread");
};

/**
 * Fetch unread notification count for the currently authenticated user.
 * Backend returns: { unreadCount }
 */
export const getUnreadCount = () => {
  return API.get("/notifications/unread/count");
};

/**
 * Mark a single notification as read by ID.
 * Backend returns: { message, notification }
 */
export const markNotificationAsRead = (id) => {
  return API.patch(`/notifications/${id}/read`);
};

/**
 * Mark all notifications for current user as read.
 * Backend returns: { message, modifiedCount }
 */
export const markAllNotificationsAsRead = () => {
  return API.patch("/notifications/read-all");
};

/**
 * Delete a notification by ID.
 * Backend returns: { message }
 */
export const deleteNotification = (id) => {
  return API.delete(`/notifications/${id}`);
};
