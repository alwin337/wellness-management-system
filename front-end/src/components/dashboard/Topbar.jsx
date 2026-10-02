import { Menu, Search, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCounsellorDisplayName, getCounsellorInitials } from "../../utils/nameHelper";

const Topbar = ({ user, role, onMenuClick }) => {
  const isCounsellor = role === "counsellor";
  const isAdmin = role === "admin";
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const getPageDetails = () => {
    // Student routes
    if (path.startsWith("/student/profile")) {
      return { title: "Profile", subtitle: "Your personal information" };
    }
    if (path.startsWith("/student/appointments")) {
      return { title: "My Sessions", subtitle: "Your upcoming and past counselling sessions" };
    }
    if (path.startsWith("/student/schedule")) {
      return { title: "Book Session", subtitle: "Schedule time with a counsellor" };
    }
    if (path.startsWith("/student/assessments")) {
      return { title: "Self Assessment", subtitle: "A short, private check-in" };
    }
    if (path.startsWith("/student/chatbot")) {
      return { title: "AI Wellness Chat", subtitle: "A safe space to talk, any time" };
    }
    if (path.startsWith("/student/facility-requests")) {
      return { title: "Facility Requests", subtitle: "Submit a report for campus maintenance" };
    }
    if (path.startsWith("/student")) {
      return { title: "Dashboard", subtitle: "Welcome back to your wellness space" };
    }

    // Admin routes
    if (path.startsWith("/admin/students")) {
      return { title: "Student Management", subtitle: "Enrolled students and activity" };
    }
    if (path.startsWith("/admin/counsellor")) {
      return { title: "Counsellor Management", subtitle: "Accounts, specializations and availability" };
    }
    if (path.startsWith("/admin/schedules")) {
      return { title: "Schedule Management", subtitle: "Availability slots and session bookings" };
    }
    if (path.startsWith("/admin/requests")) {
      return { title: "Facility Requests", subtitle: "Campus maintenance reports and resolutions" };
    }
    if (path.startsWith("/admin")) {
      return { title: "Dashboard", subtitle: "System overview and platform activity" };
    }

    return {
      title: `Welcome, ${user?.name || "User"}`,
      subtitle: `${role?.charAt(0).toUpperCase() + role?.slice(1)} Dashboard`
    };
  };

  const details = getPageDetails();

  const getAdminInitials = () => {
    if (!user?.name) return "AD";
    const parts = user.name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <header className={`border-b px-5 md:px-7 py-3.5 flex items-center justify-between transition-colors sticky top-0 z-30 ${
      isCounsellor || role === "student" || isAdmin ? "bg-white border-[#DFE6E0]" : "bg-white border-b"
    }`}>
      {/* Left: Hamburger & Page Titles */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg lg:hidden transition hover:bg-[#EBF0EC] text-[#51625C] cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {isCounsellor ? (
            <>
              <h2 className="text-lg md:text-xl font-bold text-[#152420] font-serif">
                {getCounsellorDisplayName(user?.name || "Sara Mathew")}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#7C9885] font-semibold mt-0.5">
                <span className="breathe-dot" /> Available Counsellor
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg md:text-[19px] font-bold text-[#152420] font-serif leading-tight">
                {details.title}
              </h2>
              <p className="text-xs text-[#8A9A94] font-medium font-sans mt-0.5">
                {details.subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Middle: Search bar for Admin (Desktop) */}
      {isAdmin && (
        <div className="hidden md:flex items-center gap-2 bg-[#FBFAF7] border border-[#DFE6E0] rounded-lg px-3.5 py-1.5 text-xs text-[#8A9A94] w-72 lg:w-80 shadow-2xs">
          <Search className="w-3.5 h-3.5 flex-shrink-0 text-[#8A9A94]" />
          <span className="truncate">Search students, schedules, requests…</span>
        </div>
      )}

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={() => navigate("/admin/requests")}
            className="relative w-8.5 h-8.5 rounded-lg border border-[#DFE6E0] bg-white hover:bg-[#FBFAF7] flex items-center justify-center text-[#51625C] transition cursor-pointer"
            title="Campus Notifications & Requests"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-[#B25848] text-white text-[9px] font-bold font-mono min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-1 border-2 border-white">
              !
            </span>
          </button>
        )}

        {isCounsellor ? (
          <div className="w-9 h-9 rounded-xl bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center font-bold font-serif text-xs shadow-2xs">
            {getCounsellorInitials(user?.name || "Sara Mathew")}
          </div>
        ) : isAdmin ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#DFE6E0]">
            <div className="w-9 h-9 rounded-xl bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center font-bold font-serif text-xs shadow-2xs flex-shrink-0">
              {getAdminInitials()}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-[#152420] truncate max-w-[130px]">{user?.name || "System Admin"}</div>
              <div className="text-[10.5px] text-[#8A9A94] font-medium">Administrator</div>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#1F6F5C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;