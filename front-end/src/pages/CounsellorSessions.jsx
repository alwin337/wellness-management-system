import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Eye,
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
  getMySessions,
  getSession,
  sendFeedback,
} from "../services/sessionApi";

const CounsellorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const response = await getMySessions();

      setSessions(response.data.sessions || []);
      setTotalSessions(response.data.totalSessions || 0);
    } catch (error) {
      console.error("Error fetching sessions:", error);

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

  const handleViewSession = async (sessionId) => {
    try {
      setDetailsLoading(true);

      const response = await getSession(sessionId);

      setSelectedSession(response.data.session);

      setFeedback(response.data.session?.feedback || "");
    } catch (error) {
      console.error("Error fetching session:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load session details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSendFeedback = async () => {
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

      setSelectedSession((prev) => ({
        ...prev,
        feedback: feedback.trim(),
        feedbackSent: true,
      }));

      await fetchSessions();
    } catch (error) {
      console.error("Error sending feedback:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to send feedback"
      );
    } finally {
      setFeedbackLoading(false);
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

  return (
    <DashboardLayout role="counsellor">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Session History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View completed counselling sessions and provide
            feedback.
          </p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">
            Total Sessions
          </p>

          <p className="text-3xl font-bold text-slate-800 mt-1">
            {totalSessions}
          </p>
        </div>

        {/* Session Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">
              Completed Sessions
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No sessions found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-slate-600">
                      Student
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-slate-600">
                      Department
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-slate-600">
                      Reason
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-slate-600">
                      Date
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {sessions.map((session) => (
                    <tr
                      key={session._id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {session.userId?.name || "N/A"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {session.userId?.email || ""}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {session.userId?.department || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {session.reason || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(session.sessionDate)}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewSession(session._id)
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Session Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedSession.userId?.name || "Student"}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedSession(null);
                  setFeedback("");
                }}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Student
                  </p>

                  <p className="font-medium text-slate-800">
                    {selectedSession.userId?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="font-medium text-slate-800">
                    {selectedSession.userId?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Department
                  </p>

                  <p className="font-medium text-slate-800">
                    {selectedSession.userId?.department || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Session Date
                  </p>

                  <p className="font-medium text-slate-800">
                    {formatDate(selectedSession.sessionDate)}
                  </p>
                </div>

              </div>

              {/* Reason */}
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Reason
                </p>

                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700">
                  {selectedSession.reason || "No reason provided."}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Session Notes
                </p>

                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedSession.notes || "No notes available."}
                </div>
              </div>

              {/* Feedback */}
              <div className="border-t pt-5">

                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />

                  <h3 className="font-semibold text-slate-800">
                    Feedback
                  </h3>
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(e.target.value)
                  }
                  placeholder="Enter feedback for the student..."
                  rows={4}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />

                <button
                  onClick={handleSendFeedback}
                  disabled={feedbackLoading}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {feedbackLoading
                    ? "Sending..."
                    : "Send Feedback"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Loading overlay while fetching details */}
      {detailsLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm text-slate-700">
              Loading session...
            </span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CounsellorSessions;