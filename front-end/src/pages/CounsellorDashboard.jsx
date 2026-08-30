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
  Star,
  History,
  BookOpen,
  Award,
  Loader2
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";
import Button from "../components/Button";

import { getUserProfile } from "../services/userApi";
import { getAllSchedules, addSchedule, deleteSchedule } from "../services/scheduleApi";
import { getCounsellorAppointments, updateAppointmentStatus } from "../services/appointmentApi";
import { getCounsellorReviews } from "../services/reviewApi";
import {
  createSession,
  getMySessions,
  getSession,
  sendFeedback,
  getPastAppointments,
  getStudentSessionHistory
} from "../services/sessionApi";

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

  // Session & History States
  const [completedSessions, setCompletedSessions] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  // Complete Session Modal States
  const [completingAppt, setCompletingAppt] = useState(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [completingLoading, setCompletingLoading] = useState(false);

  // Session Details Modal States
  const [viewingSessionObj, setViewingSessionObj] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Feedback States
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Student Session History States
  const [viewingStudentHistory, setViewingStudentHistory] = useState(null);
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false);

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

      // Fetch completed sessions
      let sessionData = [];
      try {
        const sRes = await getMySessions();
        sessionData = sRes.data.sessions || [];
      } catch (sErr) {
        console.warn("Failed to load completed sessions:", sErr);
      }
      setCompletedSessions(sessionData);

      // Fetch past appointments
      let pastApptData = [];
      try {
        const pRes = await getPastAppointments();
        pastApptData = pRes.data.appointments || [];
      } catch (pErr) {
        console.warn("Failed to load past appointments:", pErr);
      }
      setPastAppointments(pastApptData);

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

  // Complete session submit
  const handleCompleteSession = async (e) => {
    e.preventDefault();
    if (!completingAppt) return;
    try {
      setCompletingLoading(true);
      await createSession(completingAppt._id, sessionNotes);
      toast.success("Session marked as completed successfully");
      setCompletingAppt(null);
      setSessionNotes("");
      fetchData(); // Refresh all dashboard data
    } catch (err) {
      console.error("Complete session error:", err);
      toast.error(err.response?.data?.message || "Failed to complete session");
    } finally {
      setCompletingLoading(false);
    }
  };

  // Fetch and open session details
  const handleOpenDetails = async (sessionId) => {
    try {
      setDetailsLoading(true);
      const res = await getSession(sessionId);
      setViewingSessionObj(res.data.session);
    } catch (err) {
      console.error("Fetch session details error:", err);
      toast.error("Failed to load session details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Feedback form open
  const handleOpenFeedback = (session) => {
    setFeedbackSession(session);
    setFeedbackText("");
  };

  // Feedback submit
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackSession) return;
    if (!feedbackText.trim()) {
      toast.error("Feedback cannot be empty");
      return;
    }
    try {
      setFeedbackLoading(true);
      await sendFeedback(feedbackSession._id, feedbackText.trim());
      toast.success("Feedback sent successfully to student");
      setFeedbackSession(null);
      setFeedbackText("");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Submit feedback error:", err);
      toast.error(err.response?.data?.message || "Failed to send feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fetch and open student history
  const handleOpenStudentHistory = async (studentId) => {
    if (!studentId) return;
    try {
      setStudentHistoryLoading(true);
      const res = await getStudentSessionHistory(studentId);
      setViewingStudentHistory(res.data);
    } catch (err) {
      console.error("Error fetching student history:", err);
      toast.error("Failed to load student history");
    } finally {
      setStudentHistoryLoading(false);
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
              {activeTab === "sessions-history" && "Counselling Session History"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "dashboard" && "Track daily student appointments, bookings, and availability slots."}
              {activeTab === "appointments" && "Confirm, reject, or mark student sessions as completed."}
              {activeTab === "schedule" && "View availability slots allocated to you by the portal admin."}
              {activeTab === "sessions-history" && "Review past completed sessions and submit student feedback."}
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
            <Link
              to="/counsellor/sessions-history"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "sessions-history" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Session History
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
                            <button
                              onClick={() => handleOpenStudentHistory(appt.userId?._id)}
                              className="text-left hover:underline focus:outline-none"
                              title="Click to view student history"
                            >
                              <div className="font-semibold text-slate-800">{appt.userId?.name || "Student"}</div>
                              <div className="text-[10px] text-slate-400">{appt.userId?.email}</div>
                            </button>
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
                                onClick={() => setCompletingAppt(appt)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition animate-fade-in"
                              >
                                Complete Session
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

            {/* Processed & Past Appointments History Log */}
            <div className="mt-10 border-t pt-8 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                Processed & Past Appointments Log
              </h3>

              {pastAppointments.length === 0 ? (
                <p className="text-xs text-slate-500">No past appointment history found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Time</th>
                        <th className="pb-3 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pastAppointments.map((appt) => {
                        const statusColors = {
                          completed: "bg-purple-50 text-purple-700 border-purple-200",
                          cancelled: "bg-slate-100 text-slate-600 border-slate-200",
                          rejected: "bg-rose-50 text-rose-700 border-rose-200"
                        };
                        return (
                          <tr key={appt._id} className="hover:bg-slate-50/30 transition">
                            <td className="py-3">
                              <button
                                onClick={() => handleOpenStudentHistory(appt.userId?._id)}
                                className="text-left hover:underline focus:outline-none"
                                title="Click to view student history"
                              >
                                <div className="font-semibold text-slate-800">{appt.userId?.name || "Student"}</div>
                                <div className="text-[10px] text-slate-400">{appt.userId?.email}</div>
                              </button>
                            </td>
                            <td className="py-3 text-slate-600 font-medium">
                              {new Date(appt.appointmentDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-slate-500 font-medium">
                              {appt.startTime} - {appt.endTime}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-flex border px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                statusColors[appt.status] || "bg-slate-50 text-slate-600"
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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

        {/* ------------------- COMPLETED SESSIONS / SESSION HISTORY TAB ------------------- */}
        {activeTab === "sessions-history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <ClipboardList className="w-5.5 h-5.5 text-emerald-500" />
              Completed Counselling Sessions Logs
            </h2>

            {completedSessions.length === 0 ? (
              <EmptyState
                message="No completed sessions yet"
                subtitle="When you complete counselling sessions, they will be logged here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                      <th className="pb-3 font-semibold">Student</th>
                      <th className="pb-3 font-semibold">Appointment Date</th>
                      <th className="pb-3 font-semibold">Session Date</th>
                      <th className="pb-3 font-semibold">Time Slot</th>
                      <th className="pb-3 font-semibold">Reason</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {completedSessions.map((session) => (
                      <tr key={session._id} className="hover:bg-slate-50/30 transition">
                        <td className="py-4">
                          <button
                            onClick={() => handleOpenStudentHistory(session.userId?._id)}
                            className="text-left hover:underline focus:outline-none"
                            title="Click to view student history"
                          >
                            <div className="font-semibold text-slate-800">{session.userId?.name || "Student"}</div>
                            <div className="text-[10px] text-slate-400">{session.userId?.email}</div>
                          </button>
                        </td>
                        <td className="py-4 text-slate-600 font-medium">
                          {new Date(session.appointmentId?.appointmentDate || session.sessionDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-slate-600 font-medium">
                          {new Date(session.sessionDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-slate-500 font-medium">
                          {session.appointmentId?.startTime || "N/A"} - {session.appointmentId?.endTime || "N/A"}
                        </td>
                        <td className="py-4 text-slate-600 font-medium max-w-xs truncate" title={session.reason}>
                          {session.reason || "N/A"}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenDetails(session._id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            View Details
                          </button>
                          {session.feedbackSent ? (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                              Feedback Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenFeedback(session)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Send Feedback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ------------------- COMPLETE SESSION MODAL ------------------- */}
      {completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Complete Counselling Session</h3>
                <p className="text-xs text-slate-500 mt-1">Conclude the scheduled counselling appointment.</p>
              </div>
              <button
                onClick={() => setCompletingAppt(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-slate-50 rounded-xl border p-4 text-xs space-y-2 text-slate-600 font-medium">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Student Name</span>
                <span className="text-slate-800 font-bold text-sm">{completingAppt.userId?.name || "Student"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Date</span>
                  <span className="text-slate-700">{new Date(completingAppt.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Time Slot</span>
                  <span className="text-slate-700">{completingAppt.startTime} - {completingAppt.endTime}</span>
                </div>
              </div>
              <div className="pt-1 border-t">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Reason for Booking</span>
                <span className="text-slate-700">{completingAppt.reason || "N/A"}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Enter notes about the counselling session..."
                  rows={4}
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingAppt(null)}
                  className="w-1/2 border text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completingLoading}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-slate-400"
                >
                  {completingLoading ? "Saving..." : "Complete Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- SESSION DETAILS MODAL ------------------- */}
      {viewingSessionObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center bg-slate-50 border-b px-6 py-4">
              <h3 className="font-extrabold text-slate-800 text-lg">Counselling Session Details</h3>
              <button
                onClick={() => setViewingSessionObj(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student Information</h4>
                <div className="bg-slate-50 rounded-xl border p-4 space-y-1">
                  <p className="font-bold text-slate-800 text-sm">{viewingSessionObj.userId?.name || "N/A"}</p>
                  <p className="text-xs text-slate-500">{viewingSessionObj.userId?.email || "N/A"}</p>
                  <p className="text-xs text-slate-600">Department: {viewingSessionObj.userId?.department || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl border p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Date</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {new Date(viewingSessionObj.appointmentId?.appointmentDate || viewingSessionObj.sessionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl border p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {viewingSessionObj.appointmentId?.startTime || "N/A"} - {viewingSessionObj.appointmentId?.endTime || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reason for Appointment</h4>
                <div className="bg-slate-50 rounded-xl border p-4 text-xs text-slate-700 leading-relaxed">
                  {viewingSessionObj.reason || "N/A"}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Session Notes</h4>
                <div className="bg-slate-50 rounded-xl border p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {viewingSessionObj.notes || "No notes recorded."}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Feedback Status</h4>
                <div className="bg-slate-50 rounded-xl border p-4 text-xs text-slate-700 leading-relaxed">
                  {viewingSessionObj.feedbackSent ? (
                    <div>
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-2">Feedback Sent</span>
                      <p className="italic">"{viewingSessionObj.feedback}"</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No feedback sent yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingSessionObj(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- FEEDBACK SUBMISSION MODAL ------------------- */}
      {feedbackSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border p-6 space-y-4 animate-scale-up">
            <h3 className="font-extrabold text-slate-800 text-lg">Send Feedback</h3>
            <p className="text-xs text-slate-500">Provide session feedback for <strong className="text-slate-700">{feedbackSession.userId?.name || "Student"}</strong>.</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Feedback Notes
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter feedback details to help the student..."
                  rows={5}
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackSession(null)}
                  className="w-1/2 border text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-slate-400"
                >
                  {feedbackLoading ? "Sending..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- STUDENT HISTORY MODAL ------------------- */}
      {viewingStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center bg-slate-50 border-b px-6 py-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Student Session History</h3>
                <p className="text-xs text-slate-500">History with <strong className="text-slate-700">{viewingStudentHistory.student?.name || "Student"}</strong></p>
              </div>
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-semibold text-slate-500">Total Sessions:</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {viewingStudentHistory.totalSessions || 0}
                </span>
              </div>

              {viewingStudentHistory.sessions?.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No session history found for this student.</p>
              ) : (
                <div className="space-y-4">
                  {viewingStudentHistory.sessions.map((sess) => (
                    <div key={sess._id} className="border rounded-xl p-4 bg-slate-50 space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                        <span>Date: {new Date(sess.sessionDate).toLocaleDateString()}</span>
                        {sess.feedbackSent ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">Feedback Sent</span>
                        ) : (
                          <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border font-bold">Pending Feedback</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Reason</span>
                        <p className="text-xs text-slate-700 mt-0.5">{sess.reason || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Session Notes</span>
                        <p className="text-xs text-slate-700 mt-0.5 whitespace-pre-wrap">{sess.notes || "No notes recorded."}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CounsellorDashboard;
