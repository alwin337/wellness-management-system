import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ role, user, children }) => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">
        <Topbar user={user} />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;