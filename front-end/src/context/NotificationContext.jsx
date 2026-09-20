import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationApi";
import { NotificationContext } from "./NotificationContextObject";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  // Helper to check if a valid session exists in storage
  const hasAuthToken = () => {
    return Boolean(localStorage.getItem("token"));
  };

  // Fetch all notifications (also syncs unread count)
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!hasAuthToken()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      const res = await getMyNotifications();
      if (!isMountedRef.current) return;

      const data = res.data || {};
      const list = data.notifications || [];
      const unread = typeof data.unreadCount === "number"
        ? data.unreadCount
        : list.filter((n) => !n.isRead).length;

      setNotifications(list);
      setUnreadCount(unread);
    } catch (err) {
      if (!isMountedRef.current) return;
      // Do not treat 401 as a loud fatal error in background, just reset
      if (err.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        const msg = err.response?.data?.message || "Failed to load notifications";
        setError(msg);
      }
    } finally {
      if (isMountedRef.current && !silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch only unread count (lightweight check for badge & poll)
  const fetchUnreadCount = useCallback(async () => {
    if (!hasAuthToken()) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await getUnreadCount();
      if (!isMountedRef.current) return;
      if (typeof res.data?.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.response?.status === 401) {
        setUnreadCount(0);
      }
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    if (!id) return;

    let wasUnread = false;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          if (!item.isRead) wasUnread = true;
          return { ...item, isRead: true };
        }
        return item;
      })
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read on backend:", err);
      // Fallback: sync from server
      fetchNotifications(true);
      throw err;
    }
  }, [fetchNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      fetchNotifications(true);
      throw err;
    }
  }, [fetchNotifications]);

  // Delete notification
  const deleteItem = useCallback(async (id) => {
    if (!id) return;

    let wasUnread = false;
    setNotifications((prev) =>
      prev.filter((item) => {
        if (item._id === id) {
          if (!item.isRead) wasUnread = true;
          return false;
        }
        return true;
      })
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification on backend:", err);
      fetchNotifications(true);
      throw err;
    }
  }, [fetchNotifications]);

  // Initial load and polling setup
  useEffect(() => {
    isMountedRef.current = true;

    // Check count on mount if authenticated asynchronously to avoid cascading render warning
    const timerId = setTimeout(() => {
      if (hasAuthToken() && isMountedRef.current) {
        fetchUnreadCount();
      }
    }, 0);

    // Gentle polling interval (every 45 seconds when logged in and page is visible)
    const intervalId = setInterval(() => {
      if (hasAuthToken() && document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    }, 45000);

    // Refresh on tab focus/visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasAuthToken()) {
        fetchUnreadCount();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timerId);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteItem,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
