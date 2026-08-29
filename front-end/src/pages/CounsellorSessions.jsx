import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  History,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Mail,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  Award,
  X,
  Loader2,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  getMySessions,
  getPastAppointments,
  getSession,
  getStudentSessionHistory,
  sendFeedback,
} from "../services/sessionApi";

import { getUserProfile } from "../services/userApi";

const CounsellorSessions = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [sessions, setSessions] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(() => {
    try {
      const userString = localStorage.getItem("user");
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  });

  // Session details modal
  const [viewingSession, setViewingSession] = useState(null);
  const [sessionDetailsLoading, setSessionDetailsLoading] =
    useState(false);

  // Student history modal
  const [viewingStudentHistory, setViewingStudentHistory] =
    useState(null);

  // Feedback modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const [
        sessionsResponse,
        appointmentsResponse,
      ] = await Promise.all([
        getMySessions(),
        getPastAppointments(),
      ]);

      const sessionData = sessionsResponse.data || {};
      const appointmentData = appointmentsResponse.data || {};

      setSessions(sessionData.sessions || []);
      setTotalSessions(sessionData.totalSessions || 0);

      setPastAppointments(
        appointmentData.appointments || []
      );

      // Get current user profile for DashboardLayout
      try {
        const profileResponse = await getUserProfile();

        if (profileResponse.data?.user) {
          setProfile(profileResponse.data.user);
        }
      } catch (profileError) {
        console.warn(
          "Failed to fetch user profile. Using local storage.",
          profileError
        );
      }
    } catch (error) {
      console.error(
        "Error fetching session history:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load session history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ============================================================
  // VIEW SINGLE SESSION
  // ============================================================

  const handleViewSession = async (sessionId) => {
    try {
      setSessionDetailsLoading(true);

      const response = await getSession(sessionId);

      const session = response.data?.session;

      if (!session) {
        toast.error("Session details not found");
        return;
      }

      setViewingSession(session);
    } catch (error) {
      console.error(
        "Error fetching session:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load session details"
      );
    } finally {
      setSessionDetailsLoading(false);
    }
  };

  // ============================================================
  // VIEW STUDENT SESSION HISTORY
  // ============================================================

  const handleViewStudentHistory = async (studentId) => {
    if (!studentId) {
      toast.error("Student information is unavailable");
      return;
    }

    try {
      setSessionDetailsLoading(true);

      const response =
        await getStudentSessionHistory(studentId);

      setViewingStudentHistory(response.data);
    } catch (error) {
      console.error(
        "Error fetching student session history:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load student session history"
      );
    } finally {
      setSessionDetailsLoading(false);
    }
  };

  // ============================================================
  // OPEN FEEDBACK MODAL
  // ============================================================

  const handleOpenFeedback = (session) => {
    setSelectedSession(session);
    setFeedback(session.feedback || "");
  };

  // ============================================================
  // SEND FEEDBACK
  // ============================================================

  const handleSendFeedback = async () => {
    if (!selectedSession) return;

    if (!feedback.trim()) {
      toast.error("Please enter feedback");
      return;
    }

    try {
      setFeedbackLoading(true);

      await sendFeedback(
        selectedSession._id,
        feedback.trim()
      );

      toast.success("Feedback sent successfully");

      // Update currently selected session
      setSelectedSession((prev) => ({
        ...prev,
        feedback: feedback.trim(),
        feedbackSent: true,
      }));

      // Update the displayed session list immediately
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === selectedSession._id
            ? {
                ...session,
                feedback: feedback.trim(),
                feedbackSent: true,
              }
            : session
        )
      );

      // Close feedback modal
      setSelectedSession(null);
      setFeedback("");

      // Refresh data from backend
      await fetchSessions();
    } catch (error) {
      console.error(
        "Error sending feedback:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to send feedback"
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <DashboardLayout
        role="counsellor"
        user={profile}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />

          <p className="text-sm font-medium text-slate-500">
            Loading session history...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <DashboardLayout
      role="counsellor"
      user={profile}
    >
      <div className="space-y-8 animate-fade-in">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">

          <div className="flex items-center gap-4">

            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm flex-shrink-0">
              <History className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                Counsellor Portal
              </span>

              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                Session History
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                View completed counselling sessions and past appointments.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Total Sessions */}

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex-shrink-0">
              <History className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Sessions
              </p>

              <p className="text-3xl font-extrabold text-slate-800 mt-1 leading-none">
                {totalSessions}
              </p>
            </div>

          </div>

          {/* Information Card */}

          <div className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100/50 flex items-center gap-4 md:col-span-2">

            <div className="p-3 rounded-xl bg-emerald-100/50 text-emerald-700 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Counselling Sessions
              </p>

              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                You have completed{" "}
                {totalSessions} counselling session
                {totalSessions !== 1 ? "s" : ""}.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================
            COMPLETED SESSIONS
        ====================================================== */}

        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Completed Sessions
            </h2>

            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {sessions.length} Session
              {sessions.length !== 1 ? "s" : ""}
            </span>

          </div>

          {sessions.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">

              <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No completed sessions yet
              </h3>

              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Completed counselling sessions will appear here.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-6">

              {sessions.map((session) => {

                const studentName =
                  session.userId?.name ||
                  "Unknown Student";

                const initials = studentName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (

                  <div
                    key={session._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                  >

                    <div className="p-6 space-y-6">

                      {/* Student + Date */}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100/50">

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
                                {session.userId?.email ||
                                  "No email"}
                              </span>

                              {session.userId?.department && (
                                <>
                                  <span className="text-slate-300">
                                    •
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {session.userId.department}
                                  </span>
                                </>
                              )}

                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 w-fit">

                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />

                          <span>
                            {formatDate(session.sessionDate)}
                          </span>

                        </div>

                      </div>

                      {/* Reason + Notes */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-4">

                          <div className="flex items-center gap-2 mb-1.5 text-slate-700">

                            <FileText className="w-4 h-4 text-emerald-500" />

                            <span className="text-xs font-bold uppercase tracking-wider">
                              Reason for Visit
                            </span>

                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {session.reason ||
                              "No reason provided"}
                          </p>

                        </div>

                        <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-4">

                          <div className="flex items-center gap-2 mb-1.5 text-slate-700">

                            <MessageSquare className="w-4 h-4 text-emerald-500" />

                            <span className="text-xs font-bold uppercase tracking-wider">
                              Session Notes
                            </span>

                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">
                            {session.notes ||
                              "No notes available for this session."}
                          </p>

                        </div>

                      </div>

                      {/* Actions */}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100/50">

                        <div>

                          {session.feedbackSent ? (

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">

                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                              Feedback Sent

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">

                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                              Feedback Pending

                            </span>

                          )}

                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">

                          {/* View Details */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewSession(
                                session._id
                              )
                            }
                            className="flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Student History */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewStudentHistory(
                                session.userId?._id
                              )
                            }
                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                          >
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            Student History
                          </button>

                          {/* Feedback */}

                          {!session.feedbackSent && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFeedback(
                                  session
                                )
                              }
                              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
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

        {/* ======================================================
            PAST APPOINTMENTS
        ====================================================== */}

        <div className="space-y-4">

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Past Appointments
          </h2>

          {pastAppointments.length === 0 ? (

            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">

              <p className="text-sm text-slate-400">
                No past appointments found.
              </p>

            </div>

          ) : (

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Mobile */}

              <div className="block md:hidden divide-y divide-slate-100">

                {pastAppointments.map(
                  (appointment) => {

                    const isCompleted =
                      appointment.status ===
                      "completed";

                    return (

                      <div
                        key={appointment._id}
                        className="p-5 space-y-3"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <p className="font-bold text-slate-800 text-sm">
                              {appointment.userId?.name ||
                                "Unknown Student"}
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {appointment.userId?.email ||
                                "No email"}
                            </p>

                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />

                            {appointment.status}
                          </span>

                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">

                          <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[9px]">
                            Reason
                          </p>

                          <p className="text-slate-600">
                            {appointment.reason ||
                              "No reason provided"}
                          </p>

                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">

                          <Calendar className="w-3.5 h-3.5 text-slate-400" />

                          {formatDate(
                            appointment.appointmentDate
                          )}

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

              {/* Desktop */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">

                      <th className="px-6 py-4">
                        Student
                      </th>

                      <th className="px-6 py-4">
                        Reason
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {pastAppointments.map(
                      (appointment) => {

                        const isCompleted =
                          appointment.status ===
                          "completed";

                        return (

                          <tr
                            key={appointment._id}
                            className="hover:bg-slate-50/30 transition"
                          >

                            <td className="px-6 py-4">

                              <div className="font-semibold text-slate-800 text-sm">
                                {appointment.userId?.name ||
                                  "Unknown Student"}
                              </div>

                              <div className="text-xs text-slate-400 mt-0.5">
                                {appointment.userId?.email ||
                                  "No email"}
                              </div>

                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                              {appointment.reason ||
                                "No reason provided"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                              {formatDate(
                                appointment.appointmentDate
                              )}
                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  isCompleted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}
                              >

                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isCompleted
                                      ? "bg-emerald-500"
                                      : "bg-rose-500"
                                  }`}
                                />

                                {appointment.status}

                              </span>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </div>

        {/* ======================================================
            SESSION DETAILS MODAL
        ====================================================== */}

        {viewingSession && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between p-6 border-b border-slate-100">

                <div>

                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">

                    <FileText className="w-5 h-5 text-emerald-500" />

                    Session Details

                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Counselling session information
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewingSession(null)
                  }
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 rounded-lg hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>

              {sessionDetailsLoading ? (

                <div className="p-12 text-center">

                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />

                  <p className="text-sm text-slate-500 mt-3">
                    Loading session details...
                  </p>

                </div>

              ) : (

                <div className="p-6 space-y-6">

                  {/* Student */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Student Information
                    </h3>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                      <p className="font-bold text-slate-800 text-sm">
                        {viewingSession.userId?.name ||
                          "N/A"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {viewingSession.userId?.email ||
                          "N/A"}
                      </p>

                      <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">

                        <Building2 className="w-3.5 h-3.5 text-slate-400" />

                        Department:{" "}
                        {viewingSession.userId?.department ||
                          "N/A"}

                      </p>

                    </div>

                  </div>

                  {/* Appointment */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Appointment Schedule
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Appointment Date
                        </p>

                        <p className="font-semibold text-slate-800 mt-1 text-sm">

                          {formatDate(
                            viewingSession
                              .appointmentId
                              ?.appointmentDate
                          )}

                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Time Slot
                        </p>

                        <p className="font-semibold text-slate-800 mt-1 text-sm flex items-center gap-1.5">

                          <Clock className="w-3.5 h-3.5 text-slate-400" />

                          {viewingSession
                            .appointmentId
                            ?.startTime || "N/A"}

                          {" - "}

                          {viewingSession
                            .appointmentId
                            ?.endTime || "N/A"}

                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Reason */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Reason
                    </h3>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600">
                      {viewingSession.reason ||
                        "No reason provided"}
                    </div>

                  </div>

                  {/* Notes */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Session Notes
                    </h3>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 whitespace-pre-wrap">
                      {viewingSession.notes ||
                        "No notes available"}
                    </div>

                  </div>

                  {/* Session Date */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Session Date
                    </h3>

                    <p className="text-sm text-slate-600 font-semibold">
                      {viewingSession.sessionDate
                        ? new Date(
                            viewingSession.sessionDate
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "N/A"}
                    </p>

                  </div>

                  {/* Feedback */}

                  <div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Feedback
                    </h3>

                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

                      {viewingSession.feedbackSent ? (

                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {viewingSession.feedback ||
                            "Feedback sent"}
                        </p>

                      ) : (

                        <p className="text-sm text-slate-400">
                          Feedback has not been sent yet.
                        </p>

                      )}

                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">

                    <button
                      type="button"
                      onClick={() =>
                        setViewingSession(null)
                      }
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition"
                    >
                      Close
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}

        {/* ======================================================
            STUDENT SESSION HISTORY MODAL
        ====================================================== */}

        {viewingStudentHistory && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-2xl">

              <div className="flex items-center justify-between p-6 border-b border-slate-100">

                <div>

                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">

                    <History className="w-5 h-5 text-emerald-500" />

                    Student Session History

                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Previous counselling sessions
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewingStudentHistory(null)
                  }
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>

              <div className="p-6 space-y-6">

                {/* Student Information */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="md:col-span-2 rounded-xl bg-slate-50 border border-slate-100 p-4">

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Student
                    </p>

                    <p className="font-bold text-slate-800 text-sm mt-1">
                      {viewingStudentHistory
                        .student?.name || "N/A"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {viewingStudentHistory
                        .student?.email || "N/A"}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">

                      <Building2 className="w-3.5 h-3.5 text-slate-400" />

                      Department:{" "}
                      {viewingStudentHistory
                        .student?.department || "N/A"}

                    </p>

                  </div>

                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Total Sessions
                    </p>

                    <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                      {viewingStudentHistory
                        .totalSessions ?? 0}
                    </p>

                  </div>

                </div>

                {/* History */}

                <div>

                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Session Records
                  </h3>

                  <div className="space-y-4">

                    {viewingStudentHistory
                      .sessions?.length > 0 ? (

                      viewingStudentHistory.sessions.map(
                        (historySession) => {

                          return (

                            <div
                              key={historySession._id}
                              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                            >

                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-50">

                                <div>

                                  <p className="font-bold text-slate-800 text-sm">
                                    {historySession.reason ||
                                      "Counselling Session"}
                                  </p>

                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">

                                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />

                                    Session Date:{" "}

                                    {historySession.sessionDate
                                      ? new Date(
                                          historySession.sessionDate
                                        ).toLocaleString(
                                          "en-IN"
                                        )
                                      : "N/A"}

                                  </p>

                                </div>

                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">

                                  <span className="w-1 h-1 rounded-full bg-emerald-500" />

                                  {historySession
                                    .appointmentId
                                    ?.status || "N/A"}

                                </span>

                              </div>

                              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">

                                <div className="rounded-xl bg-slate-50/50 border border-slate-100/50 p-3">

                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Appointment Date
                                  </p>

                                  <p className="text-xs font-semibold text-slate-700 mt-1">

                                    {formatDate(
                                      historySession
                                        .appointmentId
                                        ?.appointmentDate
                                    )}

                                  </p>

                                </div>

                                <div className="rounded-xl bg-slate-50/50 border border-slate-100/50 p-3">

                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Time Slot
                                  </p>

                                  <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">

                                    <Clock className="w-3.5 h-3.5 text-slate-400" />

                                    {historySession
                                      .appointmentId
                                      ?.startTime ||
                                      "N/A"}

                                    {" - "}

                                    {historySession
                                      .appointmentId
                                      ?.endTime ||
                                      "N/A"}

                                  </p>

                                </div>

                              </div>

                            </div>

                          );

                        }
                      )

                    ) : (

                      <div className="rounded-xl bg-slate-50 p-6 text-center border border-dashed border-slate-200">

                        <p className="text-sm text-slate-400">
                          No previous sessions found for this student.
                        </p>

                      </div>

                    )}

                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">

                  <button
                    type="button"
                    onClick={() =>
                      setViewingStudentHistory(null)
                    }
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ======================================================
            FEEDBACK MODAL
        ====================================================== */}

        {selectedSession && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6">

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
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>

              </div>

              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Student
                </p>

                <p className="font-semibold text-slate-800 mt-1 text-sm">
                  {selectedSession.userId?.name ||
                    "Student"}
                </p>

                <p className="text-xs text-slate-500">
                  {selectedSession.userId?.email ||
                    "No email"}
                </p>

              </div>

              <div className="mt-5">

                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Feedback
                </label>

                <textarea
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(event.target.value)
                  }
                  placeholder="Write feedback for the student..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />

              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSession(null);
                    setFeedback("");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSendFeedback}
                  disabled={feedbackLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {feedbackLoading
                    ? "Sending..."
                    : "Send Feedback"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </DashboardLayout>
  );
};

export default CounsellorSessions;