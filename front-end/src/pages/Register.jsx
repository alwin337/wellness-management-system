import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    toast.success("Registration Successful!");

    console.log(formData);

    // Later we'll send this data to the backend using Axios
  };

  return (
    <AuthLayout>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Counselling Cell Portal
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Create Your Account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-8"
        >
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

          <Button
            text="Create Account"
            type="submit"
          />
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