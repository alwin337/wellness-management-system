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
      { name: "Students", path: "/admin/students" },
      { name: "Counsellor", path: "/admin/counsellor" },
      { name: "Schedules", path: "/admin/schedules" },
      { name: "Facility Requests", path: "/admin/requests" },
    ],
  };

  const currentMenu = menus[role] || [];

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
        fixed inset-y-0 left-0 z-50 w-64 p-6 flex flex-col justify-between
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${role === "counsellor" || role === "student" ? "bg-[#134A3D] text-white" : "bg-slate-900 text-white"}
      `}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {role === "counsellor" || role === "student" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3E9C82] to-[#1F6F5C] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 3v18M6 8c0 4 2.7 6 6 6s6-2 6-6" />
                    <circle cx="12" cy="3" r="1.4" fill="#fff" stroke="none" />
                  </svg>
                </div>
                <div>
                  <div className="font-serif text-white font-bold text-sm leading-tight tracking-tight">Wellness Management System</div>
                  <div className="text-[#9FC2B4] font-semibold text-[10.5px] uppercase tracking-wider">
                    {role === "counsellor" ? "Counsellor Portal" : "Student Wellness"}
                  </div>
                </div>
              </div>
            ) : (
              <h1 className="text-lg font-bold tracking-tight text-emerald-400 leading-tight">Wellness Management System</h1>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg lg:hidden text-gray-400 hover:text-white ${role === "counsellor" || role === "student" ? "hover:bg-white/5" : "hover:bg-slate-800"}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentMenu.map((item, idx) => {
              if (item.isDivider) {
                return <div key={`div-${idx}`} className="h-px bg-white/10 my-4 mx-2" />;
              }
              const Icon = menuIcons[item.path] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/student" || item.path === "/counsellor" || item.path === "/admin"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                      isActive
                        ? role === "counsellor" || role === "student"
                          ? "bg-white/10 text-white border-l-4 border-[#7CD9BB] pl-3"
                          : "bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20"
                        : role === "counsellor" || role === "student"
                          ? "text-[#BFDAD0] hover:bg-white/5 hover:text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full mt-auto ${
            role === "counsellor" || role === "student"
              ? "text-[#BFDAD0] border border-white/10 hover:bg-white/5 hover:text-white"
              : "text-rose-400 hover:bg-slate-800 hover:text-rose-300"
          }`}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;