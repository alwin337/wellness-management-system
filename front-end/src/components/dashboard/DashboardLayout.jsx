import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ role, user, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex min-h-screen overflow-x-hidden ${role === "counsellor" ? "counsellor-portal-theme bg-[#F2F5F2]" : "bg-gray-50"}`}>
      <Sidebar role={role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} role={role} onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;