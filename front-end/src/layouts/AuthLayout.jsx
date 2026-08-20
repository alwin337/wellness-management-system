const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;