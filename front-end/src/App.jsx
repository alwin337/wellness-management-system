import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PublicLayout from "./layouts/PublicLayouts";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resources from "./pages/Resources";
import StudentDashboard from "./pages/StudentDashboard";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CounsellorSessions from "./pages/CounsellorSessions";
import Assessments from "./pages/Assessments";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Assessments */}
        <Route
          path="/student/assessments"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Assessments />
            </ProtectedRoute>
          }
        />

        {/* Student Chatbot */}
        <Route
          path="/student/chatbot"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/:tab"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Counsellor Dashboard */}
        <Route
          path="/counsellor"
          element={
            <ProtectedRoute allowedRoles={["counsellor"]}>
              <CounsellorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Counsellor Session History */}
        <Route
          path="/counsellor/sessions"
          element={
            <ProtectedRoute allowedRoles={["counsellor"]}>
              <CounsellorSessions />
            </ProtectedRoute>
          }
        />

        {/* Other Counsellor Tabs */}
        <Route
          path="/counsellor/:tab"
          element={
            <ProtectedRoute allowedRoles={["counsellor"]}>
              <CounsellorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/:tab"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
}

export default App;