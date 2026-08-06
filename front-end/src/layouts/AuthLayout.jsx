const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;