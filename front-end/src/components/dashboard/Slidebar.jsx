import { NavLink } from "react-router-dom";

const Sidebar = ({ role = "student" }) => {
  const menus = {
    student: [
      { name: "Dashboard", path: "/student" },
      { name: "My Profile", path: "/student/profile" },
      { name: "Appointments", path: "/student/appointments" },
      { name: "Schedule", path: "/student/schedule" },
    ],
    counsellor: [
      { name: "Dashboard", path: "/counsellor" },
      { name: "My Schedule", path: "/counsellor/schedule" },
      { name: "Availability", path: "/counsellor/availability" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Students", path: "/admin/students" },
      { name: "Counsellor", path: "/admin/counsellor" },
      { name: "Schedules", path: "/admin/schedules" },
    ],
  };

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">Helping Hands</h1>

      <nav className="space-y-2">
        {menus[role].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-white text-blue-900 font-semibold"
                  : "hover:bg-blue-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;