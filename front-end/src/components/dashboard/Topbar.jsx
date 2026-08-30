import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getCounsellorDisplayName, getCounsellorInitials } from "../../utils/nameHelper";

const Topbar = ({ user, role, onMenuClick }) => {
  const isCounsellor = role === "counsellor";
  const location = useLocation();
  const path = location.pathname;

  const getPageDetails = () => {
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
    return {
      title: `Welcome, ${user?.name || "User"}`,
      subtitle: `${role?.charAt(0).toUpperCase() + role?.slice(1)} Dashboard`
    };
  };

  const details = getPageDetails();

  return (
    <div className={`border-b px-6 py-4 flex items-center justify-between transition-colors ${
      isCounsellor || role === "student" ? "bg-white border-[#DFE6E0]" : "bg-white border-b"
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`p-1.5 rounded-lg lg:hidden transition ${
            isCounsellor || role === "student" ? "hover:bg-[#EBF0EC] text-[#51625C]" : "hover:bg-slate-100 text-slate-600"
          }`}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
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
              <h2 className="text-lg md:text-xl font-bold text-slate-800 font-serif">
                {details.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium font-sans">
                {details.subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isCounsellor ? (
          <div className="w-10 h-10 rounded-full bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center font-bold font-serif shadow-sm">
            {getCounsellorInitials(user?.name || "Sara Mathew")}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/10">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;