import { Menu } from "lucide-react";

const Topbar = ({ user, onMenuClick }) => {
  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden text-slate-600 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">
            Welcome, {user?.name || "User"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/10">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
};

export default Topbar;