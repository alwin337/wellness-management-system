import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ClipboardList,
  CalendarCheck,
  AlertCircle,
  Check,
  ChevronRight,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useNotifications } from "../context/useNotifications";

// Format timestamp into human-readable relative time
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Map notification types to specific icons and visual styling
const getNotificationTypeMeta = (type) => {
  switch (type) {
    case "appointment_confirmed":
      return {
        icon: CalendarCheck,
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
        label: "Confirmed",
      };
    case "appointment_cancelled":
      return {
        icon: XCircle,
        iconBg: "bg-rose-50 text-rose-600 border-rose-200",
        label: "Cancelled",
      };
    case "appointment_completed":
      return {
        icon: CheckCircle2,
        iconBg: "bg-teal-50 text-teal-600 border-teal-200",
        label: "Completed",
      };
    case "appointment_reminder":
      return {
        icon: Clock,
        iconBg: "bg-amber-50 text-amber-600 border-amber-200",
        label: "Reminder",
      };
    case "session_feedback":
      return {
        icon: MessageSquare,
        iconBg: "bg-sky-50 text-sky-600 border-sky-200",
        label: "Feedback",
      };
    case "assessment_result":
      return {
        icon: ClipboardList,
        iconBg: "bg-purple-50 text-purple-600 border-purple-200",
        label: "Assessment",
      };
    default:
      return {
        icon: Bell,
        iconBg: "bg-slate-50 text-slate-600 border-slate-200",
        label: "System",
      };
  }
};

const NotificationBell = ({ variant = "topbar" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Handle toggling the dropdown and refreshing notifications list
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  // Mark all as read with loading state
  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Mark single notification as read
  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    // Role-aware deep link navigation if reference is present
    const userString = localStorage.getItem("user");
    let role = "student";
    try {
      if (userString) role = JSON.parse(userString).role || "student";
    } catch {
      role = "student";
    }

    if (notification.referenceType === "Appointment") {
      setIsOpen(false);
      if (role === "counsellor") navigate("/counsellor/appointments");
      else navigate("/student/appointments");
    } else if (notification.referenceType === "Session") {
      setIsOpen(false);
      if (role === "counsellor") navigate("/counsellor/sessions");
      else navigate("/student/appointments");
    } else if (notification.referenceType === "AssessmentResult") {
      setIsOpen(false);
      navigate("/student/assessments");
    }
  };

  // Button styles depending on variant
  const buttonStyle =
    variant === "navbar"
      ? "relative p-2 rounded-xl text-[#2f4f3e] hover:bg-[#e9eddf] hover:text-[#7cb342] transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#7cb342]/40"
      : "relative w-8.5 h-8.5 rounded-lg border border-[#DFE6E0] bg-white hover:bg-[#FBFAF7] flex items-center justify-center text-[#51625C] transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/30";

  // Take most recent 5 notifications for the preview dropdown
  const recentNotifications = notifications.slice(0, 6);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={buttonStyle}
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-4 h-4 flex-shrink-0" />

        {/* Unread Count Badge - hidden if 0 */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-[#B25848] text-white text-[9.5px] font-bold font-mono min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-in fade-in"
            aria-label={`${unreadCount} unread`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2.5 w-[330px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-[#DFE6E0] z-50 overflow-hidden text-left origin-top-right animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Dropdown Header */}
          <div className="px-4 py-3 bg-[#FBFAF7] border-b border-[#DFE6E0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#152420]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F1EC] text-[#1F6F5C] border border-[#D3E8DF]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-[11px] font-semibold text-[#1F6F5C] hover:text-[#134A3D] hover:underline flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" />
                  <span>{markingAll ? "Marking..." : "Mark all read"}</span>
                </button>
              )}
              <button
                onClick={() => fetchNotifications()}
                className="p-1 rounded-md text-[#8A9A94] hover:text-[#152420] hover:bg-[#EBF0EC] transition cursor-pointer"
                title="Refresh"
                aria-label="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Dropdown Body: Notification list or states */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#EBF0EC]">
            {loading && notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <div className="flex space-x-1.5 justify-center items-center">
                  <div className="h-2 w-2 bg-[#1F6F5C] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-[#1F6F5C] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-[#1F6F5C] rounded-full animate-bounce" />
                </div>
                <p className="text-xs text-[#8A9A94] font-medium">Checking notifications...</p>
              </div>
            ) : error && notifications.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-2">
                <AlertCircle className="w-7 h-7 text-[#B25848] mx-auto opacity-80" />
                <p className="text-xs text-[#51625C]">{error}</p>
                <button
                  onClick={() => fetchNotifications()}
                  className="text-xs font-semibold text-[#1F6F5C] hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#F2F5F2] flex items-center justify-center mx-auto text-[#8A9A94]">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#152420]">No notifications yet</p>
                <p className="text-[11px] text-[#8A9A94] max-w-[220px] mx-auto">
                  You are all caught up! Updates about your appointments and assessments will appear here.
                </p>
              </div>
            ) : (
              recentNotifications.map((item) => {
                const meta = getNotificationTypeMeta(item.type);
                const IconComponent = meta.icon;
                const isUnread = !item.isRead;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition cursor-pointer relative group ${
                      isUnread
                        ? "bg-[#F7FAF8] hover:bg-[#EFF6F2]"
                        : "bg-white hover:bg-[#FBFAF7]"
                    }`}
                  >
                    {/* Unread Left Border Highlight */}
                    {isUnread && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#1F6F5C] rounded-r" />
                    )}

                    {/* Notification Type Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.iconBg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            isUnread
                              ? "font-bold text-[#152420]"
                              : "font-semibold text-[#51625C]"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[#8A9A94] font-medium whitespace-nowrap">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed line-clamp-2 ${
                          isUnread ? "text-[#33463F] font-medium" : "text-[#71847D]"
                        }`}
                      >
                        {item.message}
                      </p>

                      {/* Reference tag / Mark as read trigger */}
                      <div className="flex items-center justify-between mt-1.5 pt-0.5">
                        <span className="text-[9.5px] uppercase tracking-wider font-bold text-[#8A9A94]">
                          {meta.label}
                        </span>

                        {isUnread ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item._id);
                            }}
                            className="text-[10.5px] font-semibold text-[#1F6F5C] hover:underline flex items-center gap-0.5 opacity-90 hover:opacity-100"
                            title="Mark as read"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F5C] inline-block mr-1 animate-pulse" />
                            Mark read
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#8A9A94] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-[#7C9885]" /> Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer: Full Page Link */}
          <div className="p-2.5 bg-[#FBFAF7] border-t border-[#DFE6E0] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F2F5F2] border border-[#DFE6E0] text-[#152420] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs group cursor-pointer"
            >
              <span>View all notifications</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A9A94] group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
