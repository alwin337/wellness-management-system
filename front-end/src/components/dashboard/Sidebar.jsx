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
  Wrench 
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
      { name: "My Profile", path: "/student/profile" },
      { name: "Appointments", path: "/student/appointments" },
      { name: "Schedule", path: "/student/schedule" },
      { name: "Assessments", path: "/student/assessments" },
      { name: "Chatbot", path: "/student/chatbot" },
      { name: "Facility Requests", path: "/student/facility-requests" },
    ],
    counsellor: [
      { name: "Dashboard", path: "/counsellor" },
      { name: "Appointments", path: "/counsellor/appointments" },
      { name: "Session History", path: "/counsellor/sessions" },
      { name: "Schedule", path: "/counsellor/schedule" },
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
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 flex flex-col justify-between
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-lg font-bold tracking-tight text-emerald-400 leading-tight">Wellness Management System</h1>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentMenu.map((item) => {
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
                        ? "bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20"
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition w-full mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;