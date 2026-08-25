import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, Loader2 } from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMySessions } from "../services/sessionApi";

const CounsellorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

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
            View your completed counselling sessions.
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

        {/* Sessions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">
              Sessions
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 px-6">
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
                      Session Date
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
                        <div>
                          <p className="font-medium text-slate-800">
                            {session.userId?.name || "N/A"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {session.userId?.email || ""}
                          </p>
                        </div>
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
    </DashboardLayout>
  );
};

export default CounsellorSessions;