import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/authApi";

import AuthLayout from "../layouts/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";

const Register = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // Input Handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field error
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  // Validation Logic
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Full Name is required";
    if (!formData.email.trim()) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Invalid email format";

    if (!formData.department.trim())
      tempErrors.department = "Department is required";
    if (!formData.year.trim()) tempErrors.year = "Year of study is required";

    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      tempErrors.confirmPassword = "Confirm Password is required";
    else if (formData.confirmPassword !== formData.password)
      tempErrors.confirmPassword = "Passwords do not match";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        year: formData.year,
        password: formData.password,
      });

      toast.success("Registration successful! Please log in.");
      // Reset form
      setFormData({
        name: "",
        email: "",
        department: "",
        year: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm z-20">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Counselling Cell Portal
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Create Your Account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Grid 1: Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>

          {/* Grid 2: Dept and Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Department"
              type="text"
              name="department"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
            />

            <InputField
              label="Year of Study"
              type="text"
              name="year"
              placeholder="Enter your year of study"
              value={formData.year}
              onChange={handleChange}
              error={errors.year}
            />
          </div>

          {/* Grid 3: Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          <div className="pt-2">
            <Button
              text="Create Account"
              type="submit"
            />
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?
          <Link
            to="/login"
            className="text-blue-600 ml-1.5 font-semibold hover:text-blue-700 hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;