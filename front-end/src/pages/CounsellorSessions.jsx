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
  const [sessionDetailsLoading, setSessionDetailsLoading] = useState(false);

  // Student history modal
  const [viewingStudentHistory, setViewingStudentHistory] = useState(null);

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

      const [sessionsResponse, appointmentsResponse] = await Promise.all([
        getMySessions(),
        getPastAppointments(),
      ]);

      const sessionData = sessionsResponse.data || {};
      const appointmentData = appointmentsResponse.data || {};

      setSessions(sessionData.sessions || []);
      setTotalSessions(sessionData.totalSessions || 0);
      setPastAppointments(appointmentData.appointments || []);

      // Get current user profile for DashboardLayout
      try {
        const profileResponse = await getUserProfile();
        if (profileResponse.data?.user) {
          setProfile(profileResponse.data.user);
        }
      } catch (profileError) {
        console.warn("Failed to fetch user profile. Using local storage.", profileError);
      }
    } catch (error) {
      console.error("Error fetching session history:", error);
      toast.error(error.response?.data?.message || "Failed to load session history");
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
      console.error("Error fetching session:", error);
      toast.error(error.response?.data?.message || "Failed to load session details");
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
      const response = await getStudentSessionHistory(studentId);
      setViewingStudentHistory(response.data);
    } catch (error) {
      console.error("Error fetching student session history:", error);
      toast.error(error.response?.data?.message || "Failed to load student session history");
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
      toast.error("Please enter guidance");
      return;
    }

    try {
      setFeedbackLoading(true);
      await sendFeedback(selectedSession._id, feedback.trim());
      toast.success("Guidance Sent to Student");

      // Save fallback to localStorage for local manual testing
      try {
        const fallbackGuidance = JSON.parse(localStorage.getItem("fallback_guidance") || "[]");
        const filtered = fallbackGuidance.filter(g => g.sessionId !== selectedSession._id);
        filtered.push({
          sessionId: selectedSession._id,
          appointmentId: selectedSession.appointmentId?._id || selectedSession.appointmentId,
          studentId: selectedSession.userId?._id || selectedSession.userId,
          feedback: feedback.trim(),
          feedbackSent: true,
          counsellorName: profile?.name || "Dr. Anu",
          date: new Date()
        });
        localStorage.setItem("fallback_guidance", JSON.stringify(filtered));
      } catch (err) {
        console.warn("Failed to write fallback guidance:", err);
      }

      // Update currently selected session
      setSelectedSession((prev) => ({
        ...prev,
        feedback: feedback.trim(),
        feedbackSent: true,
      }));

      // Update the session in the sessions list
      setSessions((prev) => prev.map(s => s._id === selectedSession._id ? {
        ...s,
        feedback: feedback.trim(),
        feedbackSent: true
      } : s));

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
      console.error("Error sending feedback:", error);
      toast.error(error.response?.data?.message || "Failed to send feedback");
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
      <DashboardLayout role="counsellor" user={profile}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-10 h-10 text-[#1F6F5C] animate-spin" />
          <p className="text-xs font-semibold text-[#8A9A94]">Loading session history logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <DashboardLayout role="counsellor" user={profile}>
      <div className="space-y-8 animate-fade-in font-sans">

        {/* Page Header with wave rule */}
        <div>
          <span className="text-[10.5px] font-bold text-[#7C9885] uppercase tracking-wider">Counsellor Portal</span>
          <h1 className="text-3xl font-bold font-serif text-[#152420] mt-0.5">Session History Logs</h1>
          <p className="text-xs text-[#51625C] mt-1.5 font-medium leading-relaxed">
            Review completed counselling sessions, notes logs, and past booking records.
          </p>
          <div className="wave-rule" />
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] border border-[#D3E8DF] shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider">Total Completed Sessions</p>
              <p className="text-2xl font-bold text-[#152420] mt-1 leading-none">{totalSessions}</p>
            </div>
          </div>

          <div className="bg-[#E6F1EC]/40 border border-[#D3E8DF] rounded-xl p-5 flex items-center gap-4 md:col-span-2 shadow-sm">
            <div className="p-3 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1B5B4A]">Completed Interactions</p>
              <p className="text-xs text-[#51625C] mt-1 leading-relaxed font-medium">
                You have successfully completed {totalSessions} counselling session{totalSessions !== 1 ? "s" : ""} in the system.
              </p>
            </div>
          </div>

        </div>

        {/* Completed Sessions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-[#152420] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#1F6F5C]" />
              Completed Counselling Log
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E6F1EC] text-[#1F6F5C] rounded-full border border-[#D3E8DF]">
              {sessions.length} Session{sessions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DFE6E0] p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#FBFAF7] border border-[#DFE6E0] text-[#8A9A94] rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#152420]">No completed sessions yet</h3>
              <p className="text-xs text-[#8A9A94] mt-1 max-w-sm mx-auto">
                Completed counselling sessions will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const studentName = session.userId?.name || "Anonymous Student";
                const initials = studentName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();

                return (
                  <div key={session._id} className="bg-white rounded-2xl border border-[#DFE6E0] shadow-sm hover:border-[#7C9885] transition overflow-hidden">
                    <div className="p-5 space-y-4">

                      {/* Top student details row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFE6E0]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#D3E8DF] border border-[#DFE6E0] text-[#134A3D] font-serif font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewStudentHistory(session.userId?._id)}
                              className="font-serif font-bold text-sm text-[#152420] hover:underline text-left block leading-tight"
                            >
                              {studentName}
                            </button>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-[#8A9A94] font-medium mt-1">
                              <span>{session.userId?.email || "No email logged"}</span>
                              {session.userId?.department && (
                                <>
                                  <span>•</span>
                                  <span>{session.userId.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#51625C] bg-[#FBFAF7] border border-[#DFE6E0] rounded-lg px-2.5 py-1.5 w-fit">
                          <Calendar className="w-3.5 h-3.5 text-[#1F6F5C]" />
                          <span>{formatDate(session.sessionDate)}</span>
                        </div>
                      </div>

                      {/* Reason & Notes splits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4">
                          <div className="flex items-center gap-1.5 mb-1 text-[#152420] font-bold">
                            <FileText className="w-3.5 h-3.5 text-[#1F6F5C]" />
                            <span className="text-[9px] uppercase tracking-wider">Reason for Booking</span>
                          </div>
                          <p className="text-[#51625C] leading-relaxed font-medium">{session.reason || "N/A"}</p>
                        </div>

                        <div className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4">
                          <div className="flex items-center gap-1.5 mb-1 text-[#152420] font-bold">
                            <MessageSquare className="w-3.5 h-3.5 text-[#1F6F5C]" />
                            <span className="text-[9px] uppercase tracking-wider">Session Notes</span>
                          </div>
                          <p className="text-[#51625C] leading-relaxed font-medium">{session.notes || "No notes recorded."}</p>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#DFE6E0]">
                        <div>
                          {session.feedbackSent ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#E6F1EC] text-[#1B5B4A] border border-[#D3E8DF]">
                              <span className="w-1 h-1 rounded-full bg-[#1F6F5C]" />
                              Guidance Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#FBFAF7] text-[#8A9A94] border border-[#DFE6E0]">
                              <span className="w-1 h-1 rounded-full bg-[#8A9A94]" />
                              Guidance Pending
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewSession(session._id)}
                            className="px-3.5 py-2 text-xs font-bold text-white bg-[#152420] hover:bg-[#134A3D] rounded-xl transition"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleViewStudentHistory(session.userId?._id)}
                            className="px-3.5 py-2 text-xs font-bold text-[#51625C] bg-white border border-[#DFE6E0] hover:bg-[#FBFAF7] rounded-xl transition"
                          >
                            Student History
                          </button>

                          <button
                            onClick={() => handleOpenFeedback(session)}
                            className="px-3.5 py-2 text-xs font-bold text-white bg-[#1F6F5C] hover:bg-[#134A3D] rounded-xl transition"
                          >
                            {session.feedbackSent ? "Update Guidance" : "Send Guidance"}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-serif text-[#152420] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1F6F5C]" />
            Past Appointments log
          </h2>

          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DFE6E0] p-6 text-center shadow-sm text-xs text-[#8A9A94] italic">
              No historical past appointments.
            </div>
          ) : (
            <div className="bg-white border border-[#DFE6E0] rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-[#51625C]">
                  <thead>
                    <tr className="bg-[#FBFAF7] border-b border-[#DFE6E0] text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider text-left">
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Reason for Visit</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBF0EC]">
                    {pastAppointments.map((appt) => {
                      const isCompleted = appt.status === "completed";
                      return (
                        <tr key={appt._id} className="hover:bg-[#FBFAF7] transition">
                          <td className="px-6 py-3.5">
                            <button
                              onClick={() => handleViewStudentHistory(appt.userId?._id)}
                              className="font-bold text-[#152420] hover:underline text-left block"
                            >
                              {appt.userId?.name || "Student"}
                            </button>
                            <span className="text-[10px] text-[#8A9A94] font-medium mt-0.5 block">{appt.userId?.email}</span>
                          </td>
                          <td className="px-6 py-3.5 max-w-xs truncate" title={appt.reason}>
                            {appt.reason || "N/A"}
                          </td>
                          <td className="px-6 py-3.5 font-medium">{formatDate(appt.appointmentDate)}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              isCompleted
                                ? "bg-[#E6F1EC] text-[#1B5B4A] border-[#D3E8DF]"
                                : "bg-[#F7E9E5] text-[#B25848] border-[#EAD3CD]"
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
            </div>
          )}
        </div>

      </div>

      {/* ======================================================
          MODALS SECTION
      ====================================================== */}

      {/* Session details modal */}
      {viewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#DFE6E0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FBFAF7] border-b border-[#DFE6E0]">
              <h2 className="font-serif font-bold text-[#152420] text-base">Counselling Session Details</h2>
              <button
                onClick={() => setViewingSession(null)}
                className="text-[#8A9A94] hover:text-[#51625C] p-1.5 rounded-lg hover:bg-[#EBF0EC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs font-medium text-[#51625C]">
              <div>
                <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider mb-2">Student Information</span>
                <div className="rounded-xl bg-[#FBFAF7] border border-[#DFE6E0] p-4 space-y-1">
                  <p className="font-bold text-[#152420] text-sm">{viewingSession.userId?.name || "N/A"}</p>
                  <p className="text-[#8A9A94] font-medium">{viewingSession.userId?.email || "N/A"}</p>
                  <p className="text-[#51625C]">Department: {viewingSession.userId?.department || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4">
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Appointment Date</span>
                  <p className="font-bold text-[#152420] mt-1">{formatDate(viewingSession.appointmentId?.appointmentDate)}</p>
                </div>
                <div className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4">
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Time slot</span>
                  <p className="font-bold text-[#152420] mt-1 font-mono">{viewingSession.appointmentId?.startTime} - {viewingSession.appointmentId?.endTime}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider mb-2">Reason for Visit</span>
                <p className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4 text-[#152420] leading-relaxed">{viewingSession.reason || "N/A"}</p>
              </div>

              <div>
                <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider mb-2">Private Session Notes</span>
                <p className="bg-[#FBFAF7] border border-[#DFE6E0] rounded-xl p-4 text-[#152420] leading-relaxed whitespace-pre-wrap">{viewingSession.notes || "No notes available."}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Counsellor Guidance</span>
                  {viewingSession.feedbackSent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E6F1EC] text-[#1B5B4A] border border-[#D3E8DF]">
                      <span className="w-1 h-1 rounded-full bg-[#1F6F5C]" />
                      Guidance Sent to Student
                    </span>
                  )}
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter counsellor guidance, recommendations, coping strategies, or exercises here..."
                  rows={4}
                  className="w-full border border-[#DFE6E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={async () => {
                      if (!feedback.trim()) {
                        toast.error("Please enter guidance text");
                        return;
                      }
                      try {
                        setFeedbackLoading(true);
                        await sendFeedback(viewingSession._id, feedback.trim());
                        toast.success("Guidance Sent to Student");

                        // Save fallback to localStorage
                        try {
                          const fallbackGuidance = JSON.parse(localStorage.getItem("fallback_guidance") || "[]");
                          const filtered = fallbackGuidance.filter(g => g.sessionId !== viewingSession._id);
                          filtered.push({
                            sessionId: viewingSession._id,
                            appointmentId: viewingSession.appointmentId?._id || viewingSession.appointmentId,
                            studentId: viewingSession.userId?._id || viewingSession.userId,
                            feedback: feedback.trim(),
                            feedbackSent: true,
                            counsellorName: profile?.name || "Dr. Anu",
                            date: new Date()
                          });
                          localStorage.setItem("fallback_guidance", JSON.stringify(filtered));
                        } catch (err) {
                          console.warn(err);
                        }

                        setViewingSession(prev => ({
                          ...prev,
                          feedback: feedback.trim(),
                          feedbackSent: true
                        }));
                        setSessions(prev => prev.map(s => s._id === viewingSession._id ? {
                          ...s,
                          feedback: feedback.trim(),
                          feedbackSent: true
                        } : s));
                      } catch (err) {
                        toast.error(err.response?.data?.message || "Failed to send guidance");
                      } finally {
                        setFeedbackLoading(false);
                      }
                    }}
                    disabled={feedbackLoading}
                    className="px-4 py-2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white text-xs font-bold rounded-xl transition disabled:bg-[#8A9A94]"
                  >
                    {feedbackLoading ? "Sending..." : "Send Guidance to Student"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#FBFAF7] border-t border-[#DFE6E0] px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingSession(null)}
                className="px-5 py-2.5 rounded-xl bg-[#152420] hover:bg-[#134A3D] text-white text-xs font-bold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student history modal */}
      {viewingStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#DFE6E0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FBFAF7] border-b border-[#DFE6E0]">
              <div>
                <h2 className="font-serif font-bold text-[#152420] text-base">Student Session History</h2>
                <p className="text-[10px] text-[#8A9A94] font-medium mt-0.5">Counselling records with {viewingStudentHistory.student?.name}</p>
              </div>
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="text-[#8A9A94] hover:text-[#51625C] p-1.5 rounded-lg hover:bg-[#EBF0EC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs font-medium text-[#51625C]">
              <div className="rounded-xl bg-[#FBFAF7] border border-[#DFE6E0] p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#152420] text-sm">{viewingStudentHistory.student?.name}</p>
                  <p className="text-[#8A9A94] font-medium mt-0.5">{viewingStudentHistory.student?.email} · {viewingStudentHistory.student?.department || "N/A"}</p>
                </div>
                <div className="text-center shrink-0">
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Sessions</span>
                  <span className="text-lg font-bold text-[#1F6F5C] bg-[#E6F1EC] border border-[#D3E8DF] px-2.5 py-0.5 rounded-full">{viewingStudentHistory.totalSessions || 0}</span>
                </div>
              </div>

              {viewingStudentHistory.sessions?.length === 0 ? (
                <p className="text-[#8A9A94] italic text-center py-6">No previous logs for this student.</p>
              ) : (
                <div className="space-y-3">
                  {viewingStudentHistory.sessions.map((sess) => (
                    <div key={sess._id} className="border border-[#DFE6E0] rounded-xl p-4 bg-[#FBFAF7] space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold text-[#8A9A94]">
                        <span>Date: {new Date(sess.sessionDate).toLocaleDateString()}</span>
                        {sess.feedbackSent ? (
                          <span className="text-[#1B5B4A] bg-[#E6F1EC] px-2 py-0.5 rounded-full border border-[#D3E8DF]">Feedback Sent</span>
                        ) : (
                          <span className="text-[#8A9A94] bg-[#EBF0EC] px-2 py-0.5 rounded-full border">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-[#152420] font-bold mt-1">Reason: <span className="font-semibold text-[#51625C]">{sess.reason || "N/A"}</span></p>
                      <p className="text-xs text-[#152420] font-bold">Notes: <span className="font-semibold text-[#51625C] whitespace-pre-wrap">{sess.notes || "No notes available."}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#FBFAF7] border-t border-[#DFE6E0] px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="px-5 py-2.5 rounded-xl bg-[#152420] hover:bg-[#134A3D] text-white text-xs font-bold transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback entry modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#DFE6E0] p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-bold text-[#152420] text-base">Send Counsellor Guidance</h3>
                <p className="text-xs text-[#8A9A94] mt-0.5">Submit guidance for {selectedSession.userId?.name}</p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-[#8A9A94] hover:text-[#51625C] p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#51625C] mb-2">
                  Counsellor Guidance
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter session summary, advice or follow-up milestones..."
                  rows={5}
                  className="w-full border border-[#DFE6E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="w-1/2 border border-[#DFE6E0] text-[#51625C] hover:bg-[#FBFAF7] py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendFeedback}
                  disabled={feedbackLoading}
                  className="w-1/2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-[#8A9A94]"
                >
                  {feedbackLoading ? "Sending..." : "Send Guidance to Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CounsellorSessions;