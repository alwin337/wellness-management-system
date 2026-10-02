import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  UserCircle,
  CalendarCheck,
  CalendarDays,
  Users,
  UserCog,
  History,
  LogOut,
  X,
  ClipboardList,
  MessageSquare,
  Wrench,
  Star
} from "lucide-react";

const Sidebar = ({ role = "student", isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const menuIcons = {
    // Student links
    "/student": LayoutDashboard,
    "/student/profile": UserCircle,
    "/student/appointments": CalendarCheck,
    "/student/schedule": CalendarDays,
    "/student/assessments": ClipboardList,
    "/student/chatbot": MessageSquare,
    "/student/facility-requests": Wrench,

    // Counsellor links
    "/counsellor": LayoutDashboard,
    "/counsellor/appointments": CalendarCheck,
    "/counsellor/schedule": CalendarDays,
    "/counsellor/sessions": History,
    "/counsellor/reviews": Star,
    "/counsellor/profile": UserCircle,

    // Admin links
    "/admin": LayoutDashboard,
    "/admin/students": Users,
    "/admin/counsellor": UserCog,
    "/admin/schedules": CalendarDays,
    "/admin/requests": Wrench,
  };

  const menus = {
    student: [
      { name: "Dashboard", path: "/student" },
      { name: "Self Assessment", path: "/student/assessments" },
      { name: "AI Wellness Chat", path: "/student/chatbot" },
      { name: "Book Session", path: "/student/schedule" },
      { name: "My Sessions", path: "/student/appointments" },
      { name: "Facility Requests", path: "/student/facility-requests" },
      { name: "divider", isDivider: true },
      { name: "Profile", path: "/student/profile" },
    ],
    counsellor: [
      { name: "Dashboard", path: "/counsellor" },
      { name: "Appointments", path: "/counsellor/appointments" },
      { name: "Schedule", path: "/counsellor/schedule" },
      { name: "Session History", path: "/counsellor/sessions" },
      { name: "Reviews", path: "/counsellor/reviews" },
      { name: "Profile", path: "/counsellor/profile" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Student Management", path: "/admin/students" },
      { name: "Counsellor Management", path: "/admin/counsellor" },
      { name: "Schedule Management", path: "/admin/schedules" },
      { name: "Facility Requests", path: "/admin/requests" },
    ],
  };

  const currentMenu = menus[role] || [];
  const isThemed = role === "counsellor" || role === "student" || role === "admin";

  const getPortalSubtitle = () => {
    if (role === "admin") return "Admin Console";
    if (role === "counsellor") return "Counsellor Portal";
    return "Student Wellness";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 p-5 flex flex-col justify-between
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isThemed ? "bg-[#134A3D] text-[#EAF3EF]" : "bg-slate-900 text-white"}
      `}>
        <div>
          {/* Header / Brand Mark */}
          <div className="flex items-center justify-between mb-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1F6F5C] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 3v18M6 8c0 4 2.7 6 6 6s6-2 6-6" />
                  <circle cx="12" cy="3" r="1.4" fill="#fff" stroke="none" />
                </svg>
              </div>
              <div>
                <div className="font-serif text-white font-bold text-sm leading-tight tracking-tight">Wellness System</div>
                <div className="text-[#9FC2B4] font-semibold text-[10px] uppercase tracking-wider mt-0.5">
                  {getPortalSubtitle()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg lg:hidden text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentMenu.map((item, idx) => {
              if (item.isDivider) {
                return <div key={`div-${idx}`} className="h-px bg-white/10 my-3 mx-2" />;
              }
              const Icon = menuIcons[item.path] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/student" || item.path === "/counsellor" || item.path === "/admin"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition text-[13.5px] font-medium cursor-pointer relative ${
                      isActive
                        ? "bg-white/12 text-white font-semibold before:content-[''] before:absolute before:-left-5 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#7CD9BB] before:rounded-r"
                        : "text-[#BFDAD0] hover:bg-white/6 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0 opacity-90" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#EAF3EF] border border-white/15 hover:bg-white/8 transition w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;