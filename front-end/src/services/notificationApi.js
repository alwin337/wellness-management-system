import API from "../api/axios";

// Get all notifications for logged-in user
export const getMyNotifications = () => {
  return API.get("/notifications");
};

// Get unread notifications
export const getUnreadNotifications = () => {
  return API.get("/notifications/unread");
};

// Get unread notification count
export const getUnreadCount = () => {
  return API.get("/notifications/unread/count");
};

// Mark a single notification as read
export const markNotificationAsRead = (id) => {
  return API.patch(`/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
  return API.patch("/notifications/read-all");
};

// Delete a notification
export const deleteNotification = (id) => {
  return API.delete(`/notifications/${id}`);
};
