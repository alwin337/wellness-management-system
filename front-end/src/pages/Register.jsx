import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/authApi";
import { HeartPulse, Sparkles } from "lucide-react";

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

  // Error State
  const [errors, setErrors] = useState({});

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Validate Form
  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.year.trim()) {
      newErrors.year = "Year of Study is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try{
      const { confirmPassword, ...userData } = formData;

      const response = await registerUser(userData);

      toast.success(
        response.data.message || "Registration Successful!"
      );
      
      console.log(response.data);
    
      // Clear the form after successful registration
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
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col md:flex-row min-h-[600px] z-20">
        
        {/* LEFT SIDE - Branding & Visuals (hidden on mobile, visible on medium screens and up) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-blue-900 via-blue-800 to-teal-800 p-12 flex-col justify-between relative overflow-hidden text-white">
          {/* Subtle Abstract Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-200/10 rounded-full blur-2xl"></div>

          {/* Top Logo / Branding */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
              <HeartPulse className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">Wellness Management System</span>
          </div>

          {/* Middle Messaging */}
          <div className="relative z-10 space-y-6 my-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Wellness System
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-100">
              Join the Wellness <br />
              Community 🌱
            </h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Create your secure student account to coordinate appointments, review upcoming support slots, and maintain private history details.
            </p>
          </div>

          {/* Bottom Footer / Subtle Quote */}
          <div className="relative z-10 text-xs text-blue-200/80 border-t border-white/10 pt-6">
            "Caring for your mind is the most important journey you will ever embark upon."
          </div>
        </div>

        {/* RIGHT SIDE - Form Card */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-slate-50/50">
          <div className="w-full mx-auto space-y-6">
            <div>
              {/* Mobile Branding (only visible when left side is hidden) */}
              <div className="flex items-center gap-2 md:hidden mb-4">
                <HeartPulse className="w-8 h-8 text-blue-600" />
                <span className="text-lg font-bold text-slate-800">Wellness Management System</span>
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Please fill in your student details to register on the counselling cell portal.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-6"
            >
              {/* Grid 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
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
                  placeholder="e.g. MCA, MSc"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                />

                <InputField
                  label="Year of Study"
                  type="text"
                  name="year"
                  placeholder="e.g. 1, 2, 3"
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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Verify password"
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
                className="text-blue-600 ml-1.5 font-bold hover:text-blue-700 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Register;