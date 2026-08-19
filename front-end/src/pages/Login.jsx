import LoginForm from "../components/LoginForm";
import AuthLayout from "../layouts/AuthLayout";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm z-20">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Counselling Cell Portal
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Welcome Back
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-slate-600 mt-8">
          Don't have an account?
          <Link
            to="/register"
            className="text-blue-600 ml-1.5 font-semibold hover:text-blue-700 hover:underline transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;