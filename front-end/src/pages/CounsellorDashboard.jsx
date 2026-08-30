import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  FileCheck,
  UserCheck,
  Info,
  Plus,
  Trash2,
  Star
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";
import Button from "../components/Button";

import { getUserProfile } from "../services/userApi";
import { getAllSchedules, addSchedule, deleteSchedule } from "../services/scheduleApi";
import { getCounsellorAppointments, updateAppointmentStatus } from "../services/appointmentApi";
import { getCounsellorReviews } from "../services/reviewApi";

const CounsellorDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || "dashboard";

  // State
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [updatingId, setUpdatingId] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);

  // Schedule Form State
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Fetch counsellor dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current profile
      const profileRes = await getUserProfile();
      setProfile(profileRes.data.user);
      const userObj = profileRes.data.user;

      // Fetch appointments assigned to the counsellor
      let apptList = [];
      try {
        const apptRes = await getCounsellorAppointments();
        apptList = apptRes.data.appointments || [];
      } catch (apptErr) {
        console.warn("Appointments API failed (likely due to counsellorId association on backend):", apptErr);
        // We will keep apptList empty and let it show empty/warning rather than crash
      }
      setAppointments(apptList);

      // Fetch all schedules and filter counsellor's own slots
      let schedList = [];
      try {
        const scheduleRes = await getAllSchedules();
        const allSched = scheduleRes.data.schedules || [];
        // Filter schedules where counsellor's user id matches logged-in user id
        schedList = allSched.filter(
          s => s.counsellor && s.counsellor.user && s.counsellor.user._id === userObj._id
        );
      } catch (schedErr) {
        console.warn("Schedules API failed:", schedErr);
      }
      setSchedules(schedList);

      // Fetch reviews
      let reviewsList = [];
      try {
        const reviewsRes = await getCounsellorReviews();
        reviewsList = reviewsRes.data.reviews || [];
      } catch (reviewsErr) {
        console.warn("Reviews API failed:", reviewsErr);
      }
      setReviews(reviewsList);

    } catch (err) {
      console.error("Counsellor dashboard loading error:", err);
      setError(err.response?.data?.message || "Failed to load counsellor dashboard data.");
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update appointment status
  const handleStatusChange = async (apptId, newStatus) => {
    try {
      setUpdatingId(apptId);
      await updateAppointmentStatus(apptId, newStatus);
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Counsellor add schedule slot submit
  const handleAddScheduleSlot = async (e) => {
    e.preventDefault();
    if (!slotDate || !slotStartTime || !slotEndTime) {
      toast.error("Please fill in date and times");
      return;
    }
    if (slotStartTime >= slotEndTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      setSavingSchedule(true);
      const payload = {
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime
      };
      await addSchedule(payload);
      toast.success("Schedule slot created successfully");
      
      // Reset form
      setSlotDate("");
      setSlotStartTime("");
      setSlotEndTime("");
      
      fetchData();
    } catch (err) {
      console.error("Schedule add error:", err);
      toast.error(err.response?.data?.message || "Failed to add schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  // Counsellor delete schedule slot
  const handleDeleteScheduleSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this schedule slot?")) {
      return;
    }

    try {
      await deleteSchedule(slotId);
      toast.success("Schedule slot deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete schedule slot");
    }
  };

  // Calculations for stats
  const totalAppointmentsCount = appointments.length;
  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const activeConfirmedCount = appointments.filter(a => a.status === "confirmed").length;
  const completedCount = appointments.filter(a => a.status === "completed").length;
  const totalSchedulesCount = schedules.length;

  if (loading) {
    return (
      <DashboardLayout role="counsellor" user={profile}>
        <LoadingState message="Loading counsellor workspace..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="counsellor" user={profile}>
        <ErrorState message={error} onRetry={fetchData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="counsellor" user={profile}>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Counsellor Portal</span>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {activeTab === "dashboard" && "Counsellor Workstation"}
              {activeTab === "appointments" && "Manage Appointments"}
              {activeTab === "schedule" && "Your Allocated Schedules"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "dashboard" && "Track daily student appointments, bookings, and availability slots."}
              {activeTab === "appointments" && "Confirm, reject, or mark student sessions as completed."}
              {activeTab === "schedule" && "View availability slots allocated to you by the portal admin."}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link 
              to="/counsellor"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "dashboard" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Overview
            </Link>
            <Link 
              to="/counsellor/appointments"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "appointments" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Manage Appointments
            </Link>
          </div>
        </div>

        {/* ------------------- DASHBOARD OVERVIEW TAB ------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Pending Requests"
                value={pendingCount}
                subtitle="Awaiting response"
                color="orange"
              />
              <StatCard
                title="Confirmed Sessions"
                value={activeConfirmedCount}
                subtitle="Active upcoming sessions"
                color="blue"
              />
              <StatCard
                title="Completed Sessions"
                value={completedCount}
                subtitle="Archived interactions"
                color="purple"
              />
              <StatCard
                title="Allocated Slots"
                value={totalSchedulesCount}
                subtitle="Admin configured slots"
                color="green"
              />
            </div>

            {/* Main dashboard splits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Overview Card */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-500" />
                    Counsellor Account
                  </h2>
                  <div className="text-center p-4 bg-slate-50 rounded-xl mb-4 border">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      {profile?.name?.split(" ").map(n => n[0]).join("") || "C"}
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">{profile?.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
                  </div>
                  
                  <div className="bg-emerald-50/50 text-emerald-800 p-4 rounded-xl border border-emerald-100 text-xs flex gap-2">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong>Schedule Config Restriction:</strong> As the single counsellor, your availability slots are managed by the admin. To adjust times, request an update from the administration desk.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wellness Management System</span>
                </div>
              </div>

              {/* Today's / Pending Appointments panel */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-500" />
                    Pending Appointment Requests
                  </h2>
                  <Link to="/counsellor/appointments" className="text-xs text-emerald-600 font-semibold hover:underline">
                    View all ({totalAppointmentsCount})
                  </Link>
                </div>

                {appointments.filter(a => a.status === "pending").length === 0 ? (
                  <EmptyState 
                    message="No pending requests" 
                    subtitle="All student appointments have been processed." 
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {appointments
                      .filter(a => a.status === "pending")
                      .slice(0, 3)
                      .map((appt) => (
                        <div key={appt._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 text-sm">
                              Student: {appt.userId?.name || "Registered Student"}
                            </span>
                            <div className="text-xs text-slate-500 font-medium">
                              {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })} at {appt.startTime} - {appt.endTime}
                            </div>
                            {appt.reason && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-md">
                                <strong className="text-slate-500">Reason:</strong> {appt.reason}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(appt._id, "confirmed")}
                              disabled={updatingId !== null}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusChange(appt._id, "rejected")}
                              disabled={updatingId !== null}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

            {/* Student Feedback Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                <Star className="w-5.5 h-5.5 text-emerald-500 fill-emerald-500" />
                Student Anonymous Feedback Reviews
              </h2>

              {reviews.length === 0 ? (
                <EmptyState 
                  message="No feedback reviews received yet" 
                  subtitle="Anonymous ratings and reviews from completed sessions will display here." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev, index) => (
                    <div key={rev._id || index} className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-4 h-4 ${
                                s <= rev.rating 
                                  ? "text-amber-400 fill-amber-400" 
                                  : "text-slate-200 fill-transparent"
                              }`} 
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-500 ml-1">({rev.rating}/5)</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white border px-2 py-0.5 rounded-md">
                          Anonymous
                        </span>
                      </div>

                      {rev.comment ? (
                        <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                          "{rev.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No comment provided.</p>
                      )}

                      <div className="text-[10px] text-slate-400 font-medium">
                        Submitted: {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ------------------- MANAGE APPOINTMENTS TAB ------------------- */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileCheck className="w-5.5 h-5.5 text-emerald-500" />
              All Assigned Student Appointments
            </h2>

            {appointments.length === 0 ? (
              <EmptyState 
                message="No appointments assigned" 
                subtitle="When students book slots, they will appear here." 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                      <th className="pb-3 font-semibold">Student</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 font-semibold">Reason</th>
                      <th className="pb-3 font-semibold text-center">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => {
                      const statusColors = {
                        pending: "bg-amber-50 text-amber-700 border-amber-200",
                        confirmed: "bg-blue-50 text-blue-700 border-blue-200",
                        rejected: "bg-rose-50 text-rose-700 border-rose-200",
                        completed: "bg-purple-50 text-purple-700 border-purple-200",
                        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
                      };

                      return (
                        <tr key={appt._id} className="hover:bg-slate-50/30 transition">
                          <td className="py-4">
                            <div className="font-semibold text-slate-800">{appt.userId?.name || "Student"}</div>
                            <div className="text-[10px] text-slate-400">{appt.userId?.email}</div>
                          </td>
                          <td className="py-4 font-medium text-slate-600">
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-slate-500 font-medium">
                            {appt.startTime} - {appt.endTime}
                          </td>
                          <td className="py-4 text-slate-600 font-medium max-w-xs truncate" title={appt.reason}>
                            {appt.reason || "N/A"}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex border px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              statusColors[appt.status] || statusColors.pending
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {appt.status === "pending" && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleStatusChange(appt._id, "confirmed")}
                                  disabled={updatingId !== null}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusChange(appt._id, "rejected")}
                                  disabled={updatingId !== null}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-xs font-semibold transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {appt.status === "confirmed" && (
                              <button
                                onClick={() => handleStatusChange(appt._id, "completed")}
                                disabled={updatingId !== null}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Mark Completed
                              </button>
                            )}

                            {(appt.status === "completed" || appt.status === "cancelled" || appt.status === "rejected") && (
                              <span className="text-xs text-slate-400 font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------- VIEW SCHEDULES TAB ------------------- */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Schedule Form */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 self-start">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-emerald-500" />
                Add Availability Slot
              </h2>

              <form onSubmit={handleAddScheduleSlot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingSchedule}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:bg-gray-400"
                  >
                    <Plus className="w-5.5 h-5.5" />
                    {savingSchedule ? "Adding slot..." : "Generate Slot"}
                  </button>
                </div>
              </form>
            </div>

            {/* Allocated Slots list */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-emerald-500" />
                Allocated Counselling Availability Slots
              </h2>

              {schedules.length === 0 ? (
                <EmptyState 
                  message="No allocated schedules" 
                  subtitle="Configure availability slots using the form on the left." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((slot) => (
                    <div key={slot._id} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="bg-white p-2.5 rounded-xl border">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            slot.isAvailable 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {slot.isAvailable ? "Open (Available)" : "Booked / Closed"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 text-base">
                            {new Date(slot.date).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>

                      {slot.isAvailable && (
                        <div className="pt-3 border-t border-slate-200/50 flex justify-end">
                          <button
                            onClick={() => handleDeleteScheduleSlot(slot._id)}
                            className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition inline-flex items-center"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CounsellorDashboard;