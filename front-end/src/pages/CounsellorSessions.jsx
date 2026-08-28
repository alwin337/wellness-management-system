import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  History,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  Award,
} from "lucide-react";

import {
  getMySessions,
  getPastAppointments,
  getSession,
  getStudentSessionHistory,
  sendFeedback,
} from "../services/sessionApi";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getUserProfile } from "../services/userApi";

const CounsellorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile state for DashboardLayout
  const [profile, setProfile] = useState(() => {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch (e) {
      return null;
    }
  });

  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false);
  const [viewingSession, setViewingSession] = useState(null);
  const [viewingStudentHistory, setViewingStudentHistory] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      setLoading(true);

      const [sessionsResponse, appointmentsResponse] =
        await Promise.all([
          getMySessions(),
          getPastAppointments(),
        ]);

      setSessions(sessionsResponse.data?.sessions || []);
      setPastAppointments(
        appointmentsResponse.data?.appointments || []
      );

      // Try fetching active profile for the layout topbar
      try {
        const profileRes = await getUserProfile();
        setProfile(profileRes.data.user);
      } catch (profileErr) {
        console.warn("Failed to fetch user profile, using local storage fallback", profileErr);
      }
    } catch (error) {
      console.error("SESSION DATA ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load session history"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = async (sessionId) => {
    try {
      setSessionDetailsLoading(true);
      const response = await getSession(sessionId);
      setViewingSession(response.data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error(
        error.response?.data?.message || "Failed to load session details"
      );
    } finally {
      setSessionDetailsLoading(false);
    }
  };

  const handleViewStudentHistory = async (studentId) => {
    try {
      setSessionDetailsLoading(true);
      const response = await getStudentSessionHistory(studentId);
      setViewingStudentHistory(response.data);
    } catch (error) {
      console.error("Error fetching student history:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to load student session history"
      );
    } finally {
      setSessionDetailsLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!selectedSession) return;

    if (!feedback.trim()) {
      toast.error("Feedback is required");
      return;
    }

    try {
      setSendingFeedback(true);

      await sendFeedback(
        selectedSession._id,
        feedback.trim()
      );

      toast.success("Feedback sent successfully");
      setFeedback("");
      setSelectedSession(null);

      // Refresh sessions so the updated feedback is displayed
      await loadSessionData();
    } catch (error) {
      console.error("FEEDBACK ERROR:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send feedback"
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time;
  };

  if (loading) {
    return (
      <DashboardLayout role="counsellor" user={profile}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">
            Loading session history...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="counsellor" user={profile}>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm flex-shrink-0">
              <History className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Counsellor Portal</span>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                Session History
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                View completed counselling sessions and past appointments.
              </p>
            </div>
          </div>
        </div>

        {/* Stats and Milestone Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Sessions Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 md:col-span-1">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex-shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Sessions
              </p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1 leading-none">
                {sessions.length}
              </p>
            </div>
          </div>
          
          {/* Milestone / Info Card */}
          <div className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100/50 flex items-center gap-4 md:col-span-2">
            <div className="p-3 rounded-xl bg-emerald-100/50 text-emerald-700 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Counselling Milestones</p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                You have completed {sessions.length} counselling session{sessions.length !== 1 ? 's' : ''}. Thank you for supporting the student community and making a difference in their mental wellness!
              </p>
            </div>
          </div>
        </div>

        {/* Completed Sessions Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Completed Sessions
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {sessions.length} Session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sessions.length === 0 ? (
            /* Empty State for Completed Sessions */
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No completed sessions yet</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Completed counselling sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => {
                const studentName = session.userId?.name || "Unknown Student";
                const initials = studentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={session._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* Top Row: Student Profile and Date */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100/50">
                        {/* Student Info with Avatar */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800 leading-tight">
                              {studentName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {session.userId?.email || "No email"}
                              </span>
                              {session.userId?.department && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {session.userId.department}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date Badge */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 w-fit sm:self-center">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{formatDate(session.sessionDate)}</span>
                        </div>
                      </div>

                      {/* Reason & Notes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5 text-slate-700">
                            <FileText className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Reason for Visit
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {session.reason || "No reason provided"}
                          </p>
                        </div>

                        {/* Notes Section (if notes exist) or placeholder */}
                        <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1.5 text-slate-700">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Session Notes
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {session.notes || "No notes available for this session."}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100/50">
                        {/* Feedback Status Badge */}
                        <div className="flex items-center">
                          {session.feedbackSent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Feedback Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Feedback Pending
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleViewSession(session._id)}
                            className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition duration-200 cursor-pointer shadow-sm shadow-slate-800/10"
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleViewStudentHistory(session.userId?._id)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition duration-200 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            Student History
                          </button>

                          {!session.feedbackSent && (
                            <button
                              type="button"
                              onClick={() => setSelectedSession(session)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition duration-200 cursor-pointer shadow-sm shadow-emerald-600/10"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Send Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Past Appointments
          </h2>

          {pastAppointments.length === 0 ? (
            /* Empty State for Past Appointments */
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
              <p className="text-sm text-slate-400">
                No past appointments found.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              
              {/* Mobile Past Appointments List (hidden on md) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {pastAppointments.map((appointment) => {
                  const isCompleted = appointment.status === "completed";
                  return (
                    <div key={appointment._id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {appointment.userId?.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {appointment.userId?.email || "No email"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                        <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[9px]">Reason</p>
                        <p className="text-slate-600">{appointment.reason || "No reason provided"}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(appointment.appointmentDate)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Past Appointments Table (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Reason</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pastAppointments.map((appointment) => {
                      const isCompleted = appointment.status === "completed";
                      return (
                        <tr
                          key={appointment._id}
                          className="hover:bg-slate-50/30 transition duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800 text-sm">
                              {appointment.userId?.name || "Unknown Student"}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {appointment.userId?.email || "No email"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={appointment.reason}>
                            {appointment.reason || "No reason provided"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {formatDate(appointment.appointmentDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ----------------- MODALS ----------------- */}

        {/* Feedback Modal */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Send Session Feedback
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSession(null);
                    setFeedback("");
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 hover:bg-slate-50 rounded-lg transition"
                >
                  &times;
                </button>
              </div>

              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Info</p>
                <p className="font-semibold text-slate-800 mt-1 text-sm">
                  {selectedSession.userId?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedSession.userId?.email || "No email"}
                </p>
              </div>

              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Feedback Notes
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your professional feedback and recommendations here..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSession(null);
                    setFeedback("");
                  }}
                  className="px-4.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleFeedback}
                  disabled={sendingFeedback}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/10"
                >
                  {sendingFeedback ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Details Modal */}
        {viewingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5.5 h-5.5 text-emerald-500" />
                    Session Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete counselling session record and summary
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingSession(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold hover:bg-slate-50 p-1 rounded-lg transition"
                >
                  &times;
                </button>
              </div>

              {sessionDetailsLoading ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-slate-500">Loading session details...</p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Student Info Block */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Student Information
                    </h3>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <p className="font-bold text-slate-800 text-sm">
                        {viewingSession.userId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {viewingSession.userId?.email || "N/A"}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Department: {viewingSession.userId?.department || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Appointment Info Cards */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Appointment Schedule
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Appointment Date
                        </p>
                        <p className="font-semibold text-slate-800 mt-1 text-sm">
                          {viewingSession.appointmentId?.appointmentDate
                            ? new Date(viewingSession.appointmentId.appointmentDate).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Time Slot
                        </p>
                        <p className="font-semibold text-slate-800 mt-1 text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {viewingSession.appointmentId?.startTime || "N/A"}
                          {" - "}
                          {viewingSession.appointmentId?.endTime || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Reason for Appointment
                      </h3>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[100px] text-sm text-slate-600 leading-relaxed">
                        {viewingSession.reason || "No reason provided"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Session Notes / Summary
                      </h3>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[100px] text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {viewingSession.notes || "No notes available"}
                      </div>
                    </div>
                  </div>

                  {/* Session Date & Feedback Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Completion Date & Time
                      </h3>
                      <p className="text-sm text-slate-600 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {viewingSession.sessionDate
                          ? new Date(viewingSession.sessionDate).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Counsellor Feedback
                      </h3>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        {viewingSession.feedbackSent ? (
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {viewingSession.feedback || "Feedback sent successfully."}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Feedback has not been shared for this session yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Close button in footer */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewingSession(null)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Session History Modal */}
        {viewingStudentHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-5.5 h-5.5 text-emerald-500" />
                    Student Session History
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Historical log of counselling sessions for this student
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingStudentHistory(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold hover:bg-slate-50 p-1 rounded-lg transition"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Student and Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Student Details
                    </p>
                    <p className="font-bold text-slate-800 text-sm">
                      {viewingStudentHistory.student?.name || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {viewingStudentHistory.student?.email || "N/A"}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Department: {viewingStudentHistory.student?.department || "N/A"}
                    </p>
                  </div>

                  <div className="md:col-span-1 rounded-xl bg-emerald-50 border border-emerald-100/50 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Total Sessions
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                      {viewingStudentHistory.totalSessions ?? 0}
                    </p>
                  </div>
                </div>

                {/* Session History list */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Session Records
                  </h3>

                  <div className="space-y-4">
                    {viewingStudentHistory.sessions?.length > 0 ? (
                      viewingStudentHistory.sessions.map((historySession) => {
                        const isCompleted = historySession.appointmentId?.status === "completed";
                        return (
                          <div
                            key={historySession._id}
                            className="rounded-2xl border border-slate-100 bg-white p-5 hover:border-slate-200 transition duration-150 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-50">
                              <div>
                                <p className="font-bold text-slate-800 text-sm">
                                  {historySession.reason || "Counselling Session"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                  Session Date:{" "}
                                  {historySession.sessionDate
                                    ? new Date(historySession.sessionDate).toLocaleString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </p>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border w-fit ${
                                  isCompleted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                              >
                                <span className={`w-1 h-1 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                                {historySession.appointmentId?.status || "N/A"}
                              </span>
                            </div>

                            {/* Appointment Details Grid */}
                            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div className="rounded-xl bg-slate-50/50 border border-slate-100/50 p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Appointment Date
                                </p>
                                <p className="text-xs font-semibold text-slate-700 mt-1">
                                  {historySession.appointmentId?.appointmentDate
                                    ? new Date(historySession.appointmentId.appointmentDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "N/A"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50/50 border border-slate-100/50 p-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Time Slot
                                </p>
                                <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {historySession.appointmentId?.startTime || "N/A"}
                                  {" - "}
                                  {historySession.appointmentId?.endTime || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-xl bg-slate-50 p-6 text-center border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">
                          No previous sessions found for this student.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Close Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewingStudentHistory(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CounsellorSessions;