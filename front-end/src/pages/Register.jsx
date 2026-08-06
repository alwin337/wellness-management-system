import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const Register = () => {
  return (
    <AuthLayout>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          Counselling Cell Portal
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Student Registration
        </p>

        <form className="space-y-4 mt-8">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Department"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Year of Study"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3"
          />

          <button
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </button>

        </form>

        <p className="text-center mt-6">
          Already have an account?

          <Link
            to="/login"
            className="text-blue-600 ml-2 hover:underline"
          >
            Login
          </Link>

        </p>

      </div>
    </AuthLayout>
  );
};

export default Register;