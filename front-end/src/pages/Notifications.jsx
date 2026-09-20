import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ClipboardList,
  CalendarCheck,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  ExternalLink,
  Inbox,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { LoadingState, ErrorState } from "../components/dashboard/StateViews";
import { useNotifications } from "../context/useNotifications";

// Format relative time helper
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
    year: "numeric",
  });
};

// Format exact date & time helper
const formatExactDateTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Map notification type to visual theme & icon
const getNotificationTypeMeta = (type) => {
  switch (type) {
    case "appointment_confirmed":
      return {
        icon: CalendarCheck,
        badgeBg: "bg-[#E6F1EC] text-[#1F6F5C] border-[#D3E8DF]",
        iconBg: "bg-[#E6F1EC] text-[#1F6F5C]",
        label: "Appointment Confirmed",
      };
    case "appointment_cancelled":
      return {
        icon: XCircle,
        badgeBg: "bg-[#F7E9E5] text-[#B25848] border-[#E8C7BE]",
        iconBg: "bg-[#F7E9E5] text-[#B25848]",
        label: "Appointment Cancelled",
      };
    case "appointment_completed":
      return {
        icon: CheckCircle2,
        badgeBg: "bg-[#E6F1EC] text-[#2E9276] border-[#D3E8DF]",
        iconBg: "bg-[#E6F1EC] text-[#2E9276]",
        label: "Session Completed",
      };
    case "appointment_reminder":
      return {
        icon: Clock,
        badgeBg: "bg-[#FBF3E1] text-[#B8903E] border-[#EADBB8]",
        iconBg: "bg-[#FBF3E1] text-[#B8903E]",
        label: "Reminder",
      };
    case "session_feedback":
      return {
        icon: MessageSquare,
        badgeBg: "bg-[#E7EFF4] text-[#4E7FA0] border-[#C7DCED]",
        iconBg: "bg-[#E7EFF4] text-[#4E7FA0]",
        label: "Counsellor Feedback",
      };
    case "assessment_result":
      return {
        icon: ClipboardList,
        badgeBg: "bg-[#EEEAF6] text-[#7A6BA6] border-[#D8CEEE]",
        iconBg: "bg-[#EEEAF6] text-[#7A6BA6]",
        label: "Assessment Result",
      };
    default:
      return {
        icon: Bell,
        badgeBg: "bg-[#F2F5F2] text-[#51625C] border-[#DFE6E0]",
        iconBg: "bg-[#F2F5F2] text-[#51625C]",
        label: "System Notice",
      };
  }
};

const Notifications = () => {
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [markingAll, setMarkingAll] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Load user details for layout
  const userString = localStorage.getItem("user");
  let user = null;
  try {
    if (userString) user = JSON.parse(userString);
  } catch {
    user = null;
  }
  const role = user?.role || "student";

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteItem,
  } = useNotifications();

  // Refresh notifications whenever the user navigates to the notifications page
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionInProgress(id);
      await markAsRead(id);
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to mark notification as read");
    } finally {
      setActionInProgress(null);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  // Delete single notification
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    try {
      setActionInProgress(id);
      await deleteItem(id);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setActionInProgress(null);
    }
  };

  // Helper to determine deep link path based on reference
  const getReferenceLink = (notification) => {
    if (!notification.referenceType) return null;
    if (notification.referenceType === "Appointment") {
      return role === "counsellor" ? "/counsellor/appointments" : "/student/appointments";
    }
    if (notification.referenceType === "Session") {
      return role === "counsellor" ? "/counsellor/sessions" : "/student/appointments";
    }
    if (notification.referenceType === "AssessmentResult") {
      return "/student/assessments";
    }
    return null;
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <DashboardLayout role={role} user={user}>
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-[#DFE6E0]">
          <div>
            <span className="text-xs font-semibold text-[#1F6F5C] uppercase tracking-widest font-mono">
              {role.toUpperCase()} PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152420] tracking-tight font-serif mt-1">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#8A9A94] mt-1 font-medium">
              View alerts regarding appointments, counselling guidance, and wellness activities.
            </p>
          </div>

          {/* Top Actions: Mark All Read & Refresh */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchNotifications()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-[#DFE6E0] bg-white hover:bg-[#FBFAF7] text-[#51625C] text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="px-4 py-2 rounded-xl bg-[#1F6F5C] hover:bg-[#134A3D] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{markingAll ? "Marking..." : "Mark All as Read"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE6E0] rounded-2xl p-3 shadow-2xs">
          {/* Tab Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filter === "all"
                  ? "bg-[#1F6F5C] text-white shadow-2xs"
                  : "bg-transparent text-[#51625C] hover:bg-[#F2F5F2]"
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === "all" ? "bg-white/20 text-white" : "bg-[#EBF0EC] text-[#51625C]"
                }`}
              >
                {notifications.length}
              </span>
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filter === "unread"
                  ? "bg-[#1F6F5C] text-white shadow-2xs"
                  : "bg-transparent text-[#51625C] hover:bg-[#F2F5F2]"
              }`}
            >
              <span>Unread</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === "unread" ? "bg-white/20 text-white" : "bg-[#F7E9E5] text-[#B25848]"
                }`}
              >
                {unreadCount}
              </span>
            </button>
          </div>

          {/* Quick Counter Info */}
          <div className="text-xs text-[#8A9A94] font-medium px-2">
            Showing <span className="font-bold text-[#152420]">{filteredNotifications.length}</span>{" "}
            {filter === "unread" ? "unread" : "total"}{" "}
            {filteredNotifications.length === 1 ? "notification" : "notifications"}
          </div>
        </div>

        {/* Content Area */}
        {loading && notifications.length === 0 ? (
          <LoadingState message="Loading your notifications..." />
        ) : error && notifications.length === 0 ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white border border-dashed border-[#DFE6E0] rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F5F2] text-[#8A9A94] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#152420]">
              {filter === "unread" ? "No unread notifications" : "No notifications found"}
            </h3>
            <p className="text-xs text-[#8A9A94] max-w-sm mx-auto leading-relaxed">
              {filter === "unread"
                ? "You're completely caught up! Select 'All' to review earlier notifications."
                : "You don't have any notifications right now. System alerts, session updates, and reminders will appear here."}
            </p>
            {filter === "unread" && notifications.length > 0 && (
              <button
                onClick={() => setFilter("all")}
                className="mt-2 text-xs font-bold text-[#1F6F5C] hover:underline"
              >
                View all notifications ({notifications.length})
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const meta = getNotificationTypeMeta(item.type);
              const IconComponent = meta.icon;
              const isUnread = !item.isRead;
              const refLink = getReferenceLink(item);

              return (
                <div
                  key={item._id}
                  className={`border rounded-2xl p-4 sm:p-5 transition flex flex-col sm:flex-row items-start gap-4 relative group ${
                    isUnread
                      ? "bg-white border-[#C7DCED] shadow-sm hover:border-[#1F6F5C]/40 border-l-4 border-l-[#1F6F5C]"
                      : "bg-white/80 border-[#DFE6E0] hover:border-[#CAD4CC] opacity-95"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm ${
                          isUnread ? "font-bold text-[#152420]" : "font-semibold text-[#51625C]"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}
                      >
                        {meta.label}
                      </span>

                      {/* Unread Pill */}
                      {isUnread && (
                        <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#1F6F5C] text-white font-mono tracking-wider">
                          New
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isUnread ? "text-[#152420] font-medium" : "text-[#71847D]"
                      }`}
                    >
                      {item.message}
                    </p>

                    {/* Timestamp & Reference link */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#8A9A94]">
                      <span
                        className="flex items-center gap-1 font-medium"
                        title={formatExactDateTime(item.createdAt)}
                      >
                        <Calendar className="w-3 h-3 text-[#8A9A94]" />
                        {formatRelativeTime(item.createdAt)}
                      </span>

                      <span className="text-[#DFE6E0]">•</span>
                      <span className="text-[10.5px] text-[#8A9A94]">
                        {formatExactDateTime(item.createdAt)}
                      </span>

                      {refLink && (
                        <>
                          <span className="text-[#DFE6E0]">•</span>
                          <Link
                            to={refLink}
                            className="text-xs font-bold text-[#1F6F5C] hover:text-[#134A3D] hover:underline flex items-center gap-1"
                          >
                            <span>Open details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:pl-3 sm:border-l sm:border-[#DFE6E0]/60 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DFE6E0]/40">
                    {isUnread ? (
                      <button
                        onClick={(e) => handleMarkAsRead(item._id, e)}
                        disabled={actionInProgress === item._id}
                        className="px-3 py-1.5 rounded-lg border border-[#D3E8DF] bg-[#E6F1EC] hover:bg-[#D3E8DF] text-[#1F6F5C] text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#8A9A94] flex items-center gap-1 px-2 py-1">
                        <Check className="w-3 h-3 text-[#7C9885]" /> Read
                      </span>
                    )}

                    {/* Delete action (supported by backend) */}
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      disabled={actionInProgress === item._id}
                      className="p-1.5 rounded-lg text-[#8A9A94] hover:text-[#B25848] hover:bg-[#F7E9E5] transition cursor-pointer"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
