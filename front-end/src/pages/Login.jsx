import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

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

          <span className="text-blue-600 ml-2 cursor-pointer">
            Register
          </span>

        </p>

      </div>

    </div>
  );
};

export default Login;