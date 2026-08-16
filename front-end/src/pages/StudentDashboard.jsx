import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import API from "../api/axios";

const StudentDashboard = () => {
  const [user, setUser] = useState({
    name: "Student",
    role: "student",
    department: "MCA",
  });

  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: replace with token from login later
        const token = localStorage.getItem("token");

        const profileRes = await API.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(profileRes.data);

        const scheduleRes = await API.get("/schedules", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSchedules(scheduleRes.data || []);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout role="student" user={user}>
      <div className="space-y-8">
        {/* Page Heading */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Student Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Access counselling services, view schedules, and manage your profile.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Upcoming Appointments"
            value="0"
            subtitle="No appointment booked yet"
            color="blue"
          />

          <StatCard
            title="Available Counselling Slots"
            value={schedules.length}
            subtitle="This week"
            color="green"
          />

          <StatCard
            title="Sessions Completed"
            value="0"
            subtitle="Track your counselling journey"
            color="purple"
          />

          <StatCard
            title="Profile Status"
            value="Complete"
            subtitle={user.department || "Department not set"}
            color="orange"
          />
        </div>

        {/* Counsellor Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Counsellor
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
              C
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                College Counsellor
              </h3>
              <p className="text-gray-500">
                Student Wellness & Academic Support
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition">
              Book Appointment
            </button>

            <button className="border border-blue-600 text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition">
              View Schedule
            </button>
          </div>
        </div>

        {/* Available Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available Counselling Schedule
          </h2>

          {schedules.length === 0 ? (
            <p className="text-gray-500">
              No schedules available right now.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left text-gray-600">
                    <th className="py-3">Date</th>
                    <th className="py-3">Time</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {schedules.map((slot, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        {slot.date || "--"}
                      </td>
                      <td className="py-3">
                        {slot.time || "--"}
                      </td>
                      <td className="py-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {slot.status || "Available"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;