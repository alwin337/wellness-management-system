import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PublicLayout from "./layouts/PublicLayouts";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/counsellor" element={<CounsellorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
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