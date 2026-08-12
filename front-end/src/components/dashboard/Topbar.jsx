const Topbar = ({ user }) => {
  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name || "User"}
        </h2>
        <p className="text-gray-500">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>
      </div>
    </div>
  );
};

export default Topbar;