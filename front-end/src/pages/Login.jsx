import LoginForm from "../components/LoginForm";
import AuthLayout from "../layouts/AuthLayout";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <AuthLayout>

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          Counselling Cell Portal
        </h1>

        <p className="text-center text-gray-500 mt-2">
          AI-Powered Student Wellness System
        </p>

        <h2 className="text-2xl font-semibold text-center mt-8">
          Welcome Back 👋
        </h2>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="text-center mt-6">
          Don't have an account?

          <Link
            to="/register"
            className="text-blue-600 ml-2 hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </AuthLayout>
  );
};

export default Login;