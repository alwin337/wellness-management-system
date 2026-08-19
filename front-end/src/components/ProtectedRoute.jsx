import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  let user = null;

  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on their role
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "counsellor") return <Navigate to="/counsellor" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
