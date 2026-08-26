import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  History,
  CalendarDays,
  User,
  Mail,
  Building2,
  FileText,
  MessageSquare,
} from "lucide-react";

import {
  getMySessions,
  getPastAppointments,
  sendFeedback,
} from "../services/sessionApi";

const CounsellorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState(null);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">
          Loading session history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <History className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Session History
            </h1>

            <p className="text-sm text-slate-500">
              View completed counselling sessions and past appointments.
            </p>
          </div>
        </div>
      </div>

      {/* Session count */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <p className="text-sm text-slate-500">
          Total Sessions
        </p>

        <p className="text-3xl font-bold text-slate-800 mt-1">
          {sessions.length}
        </p>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Completed Sessions
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 text-center">
            <History className="w-10 h-10 mx-auto text-slate-300" />

            <p className="mt-3 text-slate-500">
              No sessions found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {sessions.map((session) => (
              <div
                key={session._id}
                className="p-6 hover:bg-slate-50 transition"
              >

                {/* Student information */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="space-y-2">

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-500" />

                      <span className="font-semibold text-slate-800">
                        {session.userId?.name || "Unknown Student"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-4 h-4" />

                      {session.userId?.email || "No email"}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-4 h-4" />

                      {session.userId?.department || "No department"}
                    </div>

                  </div>

                  {/* Session date */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />

                    {formatDate(session.sessionDate)}
                  </div>

                </div>

                {/* Reason */}
                <div className="mt-4 p-4 rounded-xl bg-slate-50">

                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-slate-500" />

                    <span className="text-sm font-medium text-slate-700">
                      Reason
                    </span>
                  </div>

                  <p className="text-sm text-slate-600">
                    {session.reason || "No reason provided"}
                  </p>

                </div>

                {/* Notes */}
                {session.notes && (
                  <div className="mt-3">

                    <p className="text-sm font-medium text-slate-700">
                      Notes
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {session.notes}
                    </p>

                  </div>
                )}

                {/* Feedback */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

                  <div>
                    {session.feedbackSent ? (
                      <span className="text-sm text-emerald-600 font-medium">
                        Feedback sent
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Feedback not sent
                      </span>
                    )}
                  </div>

                  {!session.feedbackSent && (
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Feedback
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Past appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Past Appointments
          </h2>
        </div>

        {pastAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No past appointments found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {pastAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >

                <div>
                  <p className="font-medium text-slate-800">
                    {appointment.userId?.name || "Unknown Student"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {appointment.reason || "No reason provided"}
                  </p>
                </div>

                <div className="text-sm text-slate-500">
                  {formatDate(appointment.appointmentDate)}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                    appointment.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {appointment.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Feedback Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

            <h2 className="text-xl font-semibold text-slate-800">
              Send Feedback
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Feedback for{" "}
              <span className="font-medium">
                {selectedSession.userId?.name}
              </span>
            </p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback..."
              rows={5}
              className="w-full mt-5 border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex justify-end gap-3 mt-5">

              <button
                onClick={() => {
                  setSelectedSession(null);
                  setFeedback("");
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={handleFeedback}
                disabled={sendingFeedback}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {sendingFeedback
                  ? "Sending..."
                  : "Send Feedback"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default CounsellorSessions;