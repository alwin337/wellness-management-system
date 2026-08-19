const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Background soft shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>
      
      {/* Content wrapper */}
      <div className="w-full flex items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;