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
  Loader2,
  Mail,
  Building,
  UserCog,
  Wrench,
  ChevronRight,
  Sliders
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";

import { getUserProfile, updateUserProfile } from "../services/userApi";
import { getAllSchedules, addSchedule, deleteSchedule } from "../services/scheduleApi";
import { getCounsellorAppointments, updateAppointmentStatus } from "../services/appointmentApi";
import { getCounsellorReviews } from "../services/reviewApi";
import { getAllCounsellors } from "../services/counsellorApi";
import {
  createSession,
  getMySessions,
  getSession,
  sendFeedback,
  getPastAppointments,
  getStudentSessionHistory
} from "../services/sessionApi";
import { getCounsellorDisplayName, getCounsellorInitials } from "../utils/nameHelper";

const CounsellorDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || "dashboard";

  // State
  const [profile, setProfile] = useState(null);
  const [counsellorDetails, setCounsellorDetails] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Sub-tabs & Filter States
  const [apptSubTab, setApptSubTab] = useState("pending");
  const [reviewsFilter, setReviewsFilter] = useState("all");
  const [dashboardUpcomingFilter, setDashboardUpcomingFilter] = useState("today");

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

  // Profile Form Modal States
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

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
        console.warn("Appointments API failed:", apptErr);
      }
      setAppointments(apptList);

      // Fetch all schedules and filter counsellor's own slots
      let schedList = [];
      try {
        const scheduleRes = await getAllSchedules();
        const allSched = scheduleRes.data.schedules || [];
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

      // Fetch counsellor detail profile (specialization, contact number)
      let detailObj = null;
      try {
        const cRes = await getAllCounsellors();
        const counsellors = cRes.data.counsellors || [];
        detailObj = counsellors.find(c => c.user && c.user._id === userObj._id);
      } catch (cErr) {
        console.warn("Failed to retrieve details specialization:", cErr);
      }
      setCounsellorDetails(detailObj);

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

  // Update appointment status (accept / reject)
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
      toast.success("Session completed and notes added successfully");
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
      setFeedbackText(res.data.session?.feedback || "");
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
    setFeedbackText(session.feedback || "");
  };

  // Feedback submit
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackSession) return;
    if (!feedbackText.trim()) {
      toast.error("Please enter guidance text");
      return;
    }
    try {
      setFeedbackLoading(true);
      await sendFeedback(feedbackSession._id, feedbackText.trim());
      toast.success("Guidance Sent to Student");

      // Save fallback to localStorage
      try {
        const fallbackGuidance = JSON.parse(localStorage.getItem("fallback_guidance") || "[]");
        const filtered = fallbackGuidance.filter(g => g.sessionId !== feedbackSession._id);
        filtered.push({
          sessionId: feedbackSession._id,
          appointmentId: feedbackSession.appointmentId?._id || feedbackSession.appointmentId,
          studentId: feedbackSession.userId?._id || feedbackSession.userId,
          feedback: feedbackText.trim(),
          feedbackSent: true,
          counsellorName: profile?.name || "Dr. Anu",
          date: new Date()
        });
        localStorage.setItem("fallback_guidance", JSON.stringify(filtered));
      } catch (err) {
        console.warn(err);
      }

      setFeedbackSession(null);
      setFeedbackText("");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Submit feedback error:", err);
      toast.error(err.response?.data?.message || "Failed to send guidance");
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

  // Profile update submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setSavingProfile(true);
      await updateUserProfile({
        name: editName.trim(),
        department: editDept.trim()
      });
      toast.success("Profile details updated");
      setEditingProfile(false);
      fetchData();
    } catch (err) {
      console.error("Profile edit error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(profile?.name || "");
    setEditDept(profile?.department || "");
    setEditingProfile(true);
  };

  // Dynamic values & calculations
  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const activeConfirmedCount = appointments.filter(a => a.status === "confirmed").length;
  const totalAppointmentsCount = appointments.length;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Today's Appointments helper
  const todayAppointments = appointments.filter(a =>
    new Date(a.appointmentDate).toDateString() === new Date().toDateString() &&
    a.status === "confirmed"
  );

  // Dynamic weekdays calculations for bar chart
  const getWeekdayCompletions = (dayOfWeekIndex) => {
    return completedSessions.filter(s => new Date(s.sessionDate).getDay() === dayOfWeekIndex).length;
  };

  const mon = getWeekdayCompletions(1);
  const tue = getWeekdayCompletions(2);
  const wed = getWeekdayCompletions(3);
  const thu = getWeekdayCompletions(4);
  const fri = getWeekdayCompletions(5);
  const sat = getWeekdayCompletions(6);
  const sun = getWeekdayCompletions(0);
  const maxDayVal = Math.max(mon, tue, wed, thu, fri, sat, sun, 1);

  // Review count rating breakdown
  const getStarRatingCount = (stars) => reviews.filter(r => r.rating === stars).length;

  // Stars renderer helper
  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rounded ? "fill-[#B8903E] text-[#B8903E]" : "text-[#DFE6E0]"}`}
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <DashboardLayout role="counsellor" user={profile}>
        <LoadingState message="Loading your counsellor portal workspace..." />
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
      <div className="space-y-8 animate-fade-in font-sans">

        {/* Header section with calm wave rule */}
        <div>
          <span className="text-[10.5px] font-bold text-[#7C9885] uppercase tracking-wider">Counsellor Workstation</span>
          <h1 className="text-3xl font-bold font-serif text-[#152420] mt-1 leading-tight">
            {activeTab === "dashboard" && `Good morning, ${getCounsellorDisplayName(profile?.name || "Mathew")} 🌿`}
            {activeTab === "appointments" && "Appointment Management"}
            {activeTab === "schedule" && "Schedule & Availability"}
            {activeTab === "reviews" && "Student Feedback & Reviews"}
            {activeTab === "profile" && "Counsellor Profile Directory"}
          </h1>
          <p className="text-xs text-[#51625C] mt-1.5 font-medium leading-relaxed">
            {activeTab === "dashboard" && "Track daily student appointments, bookings, and availability slots."}
            {activeTab === "appointments" && "Review, accept, reject and mark student counselling sessions."}
            {activeTab === "schedule" && "Set availability hours allocated by the portal administration."}
            {activeTab === "reviews" && "Review ratings and comments submitted anonymously by students."}
            {activeTab === "profile" && "Manage your professional biography, specialties, and contact details."}
          </p>
          <div className="wave-rule" />
        </div>

        {/* =================================================================
             1. DASHBOARD OVERVIEW PANEL
        ================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#E7EFF4] text-[#4E7FA0] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">{todayAppointments.length}</div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Today's Sessions</div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#EEEAF6] text-[#7A6BA6] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">{activeConfirmedCount}</div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Confirmed Slots</div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">{completedSessions.length}</div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Completed Sessions</div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-[#FBF3E1] text-[#B8903E] flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">{pendingCount}</div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Pending Requests</div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">{schedules.filter(s => s.isAvailable).length}</div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Available Slots</div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#FBF3E1] text-[#B8903E] flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[#152420] text-2xl font-bold mt-4 leading-none">
                    {avgRating} <span className="text-[11px] font-sans font-semibold text-[#8A9A94]">({reviews.length})</span>
                  </div>
                  <div className="text-[#8A9A94] text-[10px] font-bold uppercase tracking-wider mt-2.5">Average Rating</div>
                </div>
              </div>

            </div>

            {/* Split Content columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Today's Schedule + Upcoming Table */}
              <div className="lg:col-span-2 space-y-6">

                {/* Today's Schedule Cards List */}
                <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-base font-bold font-serif text-[#152420] mb-4">Today's Schedule</h2>

                  {todayAppointments.length === 0 ? (
                    <EmptyState
                      message="No sessions scheduled for today"
                      subtitle="Confirm pending requests or allocate slots to open bookings."
                    />
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.map((appt) => (
                        <div key={appt._id} className="border border-[#DFE6E0] hover:border-[#7C9885] transition rounded-xl p-4 flex items-center gap-4 bg-[#FBFAF7]">
                          <div className="text-center w-14 shrink-0">
                            <span className="font-mono text-xs font-bold text-[#1F6F5C] block">{appt.startTime}</span>
                            <span className="text-[10px] text-[#8A9A94] uppercase font-bold mt-0.5 block">{appt.endTime}</span>
                          </div>
                          <div className="w-px self-stretch bg-[#DFE6E0]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleOpenStudentHistory(appt.userId?._id)}
                                className="font-bold text-sm text-[#152420] hover:underline text-left"
                              >
                                {appt.userId?.name || "Student"}
                              </button>
                              <span className="inline-flex items-center text-[10px] font-bold text-[#2E5D7C] bg-[#E7EFF4] px-2 py-0.5 rounded-full">
                                Confirmed
                              </span>
                            </div>
                            <div className="text-xs text-[#51625C] mt-1.5 flex items-center gap-2 flex-wrap font-medium">
                              <span>{appt.reason || "Counselling Visit"}</span>
                              <span className="w-1 h-1 rounded-full bg-[#8A9A94]" />
                              <span className="inline-flex items-center text-[10px] font-bold text-[#8A6A20] bg-[#FBF3E1] px-2 py-0.5 rounded-md">
                                Online Meeting
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex gap-2">
                            <button
                              onClick={() => setCompletingAppt(appt)}
                              className="px-3 py-1.5 bg-[#1F6F5C] hover:bg-[#134A3D] text-white rounded-lg text-xs font-semibold transition"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Table */}
                <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-base font-bold font-serif text-[#152420]">Upcoming Appointments</h2>

                    <div className="flex bg-[#FBFAF7] border border-[#DFE6E0] rounded-lg p-1 text-[11px] font-bold">
                      <button
                        onClick={() => setDashboardUpcomingFilter("today")}
                        className={`px-3 py-1.5 rounded-md transition ${dashboardUpcomingFilter === "today" ? "bg-white text-[#1F6F5C] shadow-sm" : "text-[#51625C] hover:text-[#152420]"}`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setDashboardUpcomingFilter("all")}
                        className={`px-3 py-1.5 rounded-md transition ${dashboardUpcomingFilter === "all" ? "bg-white text-[#1F6F5C] shadow-sm" : "text-[#51625C] hover:text-[#152420]"}`}
                      >
                        All
                      </button>
                    </div>
                  </div>

                  {appointments.filter(a => {
                    if (dashboardUpcomingFilter === "today") {
                      return new Date(a.appointmentDate).toDateString() === new Date().toDateString() && a.status === "confirmed";
                    }
                    return a.status === "confirmed" || a.status === "pending";
                  }).length === 0 ? (
                    <EmptyState
                      message="No upcoming appointments"
                      subtitle="Confirmed and pending student bookings will be listed here."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs text-[#51625C]">
                        <thead>
                          <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[9px] font-bold border-b border-[#DFE6E0]">
                            <th className="pb-2">Student</th>
                            <th className="pb-2">Date &amp; Time</th>
                            <th className="pb-2">Type / Reason</th>
                            <th className="pb-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBF0EC]">
                          {appointments.filter(a => {
                            if (dashboardUpcomingFilter === "today") {
                              return new Date(a.appointmentDate).toDateString() === new Date().toDateString() && a.status === "confirmed";
                            }
                            return a.status === "confirmed" || a.status === "pending";
                          }).map((appt) => (
                            <tr key={appt._id} className="hover:bg-[#FBFAF7] transition">
                              <td className="py-3 font-semibold text-[#152420]">
                                <button
                                  onClick={() => handleOpenStudentHistory(appt.userId?._id)}
                                  className="hover:underline text-left"
                                >
                                  {appt.userId?.name || "Student"}
                                </button>
                              </td>
                              <td className="py-3 font-medium">
                                {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.startTime}
                              </td>
                              <td className="py-3 font-medium max-w-[150px] truncate" title={appt.reason}>
                                {appt.reason || "Counselling Session"}
                              </td>
                              <td className="py-3 text-right">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  appt.status === "confirmed"
                                    ? "bg-[#E7EFF4] text-[#2E5D7C] border-[#B9D0E0]"
                                    : "bg-[#FBF3E1] text-[#8A6A20] border-[#EAD2A1]"
                                }`}>
                                  {appt.status}
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

              {/* Right Column: Quick Actions + Weekly Completions Chart */}
              <div className="space-y-6">

                {/* Quick Actions Panel */}
                <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-base font-bold font-serif text-[#152420] mb-4">Quick Workstation Actions</h2>
                  <div className="space-y-2">
                    <Link to="/counsellor/schedule" className="flex items-center justify-between border border-[#DFE6E0] hover:border-[#7C9885] p-3 rounded-xl bg-[#FBFAF7] text-xs font-semibold text-[#51625C] hover:text-[#152420] transition group">
                      <span className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#1F6F5C]" />
                        Configure Availability Slots
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link to="/counsellor/appointments" className="flex items-center justify-between border border-[#DFE6E0] hover:border-[#7C9885] p-3 rounded-xl bg-[#FBFAF7] text-xs font-semibold text-[#51625C] hover:text-[#152420] transition group">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-[#1F6F5C]" />
                        Review Booking Requests
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link to="/counsellor/sessions" className="flex items-center justify-between border border-[#DFE6E0] hover:border-[#7C9885] p-3 rounded-xl bg-[#FBFAF7] text-xs font-semibold text-[#51625C] hover:text-[#152420] transition group">
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#1F6F5C]" />
                        Access Completed Sessions
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link to="/counsellor/reviews" className="flex items-center justify-between border border-[#DFE6E0] hover:border-[#7C9885] p-3 rounded-xl bg-[#FBFAF7] text-xs font-semibold text-[#51625C] hover:text-[#152420] transition group">
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#1F6F5C]" />
                        View Anonymous Reviews
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link to="/counsellor/profile" className="flex items-center justify-between border border-[#DFE6E0] hover:border-[#7C9885] p-3 rounded-xl bg-[#FBFAF7] text-xs font-semibold text-[#51625C] hover:text-[#152420] transition group">
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#1F6F5C]" />
                        Edit Directory Profile
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* This Week Completions Chart */}
                <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-base font-bold font-serif text-[#152420] mb-0.5">This Week</h2>
                  <p className="text-[10px] text-[#8A9A94] uppercase tracking-wider font-bold mb-4">Completed Counselling sessions</p>

                  <div className="flex items-end gap-2.5 h-24 pt-2 border-b border-[#DFE6E0] mb-4">
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(mon / maxDayVal) * 100}%` }} title={`${mon} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">M</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(tue / maxDayVal) * 100}%` }} title={`${tue} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">T</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(wed / maxDayVal) * 100}%` }} title={`${wed} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">W</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(thu / maxDayVal) * 100}%` }} title={`${thu} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">T</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#1F6F5C] rounded-t-sm transition-all" style={{ height: `${(fri / maxDayVal) * 100}%` }} title={`${fri} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94] font-bold">F</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(sat / maxDayVal) * 100}%` }} title={`${sat} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">S</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <div className="w-full bg-[#D3E8DF] rounded-t-sm transition-all" style={{ height: `${(sun / maxDayVal) * 100}%` }} title={`${sun} sessions`} />
                      <span className="font-mono text-[9px] text-[#8A9A94]">S</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[#51625C]">
                    <div className="bg-[#FBFAF7] p-2 border border-[#DFE6E0] rounded-lg">
                      <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">This Month</span>
                      <span className="text-sm font-bold text-[#152420] mt-1 block">{completedSessions.length}</span>
                    </div>
                    <div className="bg-[#FBFAF7] p-2 border border-[#DFE6E0] rounded-lg">
                      <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Cancellations</span>
                      <span className="text-sm font-bold text-[#B25848] mt-1 block">
                        {appointments.filter(a => a.status === "cancelled").length}
                      </span>
                    </div>
                    <div className="bg-[#FBFAF7] p-2 border border-[#DFE6E0] rounded-lg">
                      <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Rejections</span>
                      <span className="text-sm font-bold text-[#B8903E] mt-1 block">
                        {appointments.filter(a => a.status === "rejected").length}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================================
             2. APPOINTMENT MANAGEMENT PANEL
        ================================================================== */}
        {activeTab === "appointments" && (
          <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">

            {/* Sub Tabs navbar */}
            <div className="flex gap-1 border-b border-[#DFE6E0] pb-px overflow-x-auto mb-6">
              {[
                { id: "pending", label: "Pending Requests", count: pendingCount },
                { id: "confirmed", label: "Confirmed Slots", count: activeConfirmedCount },
                { id: "completed", label: "Completed", count: appointments.filter(a => a.status === "completed").length },
                { id: "cancelled", label: "Cancelled", count: appointments.filter(a => a.status === "cancelled").length },
                { id: "rejected", label: "Rejected Requests", count: appointments.filter(a => a.status === "rejected").length }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setApptSubTab(subTab.id)}
                  className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                    apptSubTab === subTab.id
                      ? "border-[#1F6F5C] text-[#1F6F5C]"
                      : "border-transparent text-[#8A9A94] hover:text-[#51625C]"
                  }`}
                >
                  {subTab.label}
                  {subTab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                      apptSubTab === subTab.id ? "bg-[#E6F1EC] text-[#1F6F5C]" : "bg-[#FBFAF7] text-[#8A9A94] border"
                    }`}>
                      {subTab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List Panels content */}
            <div className="space-y-4">

              {appointments.filter(a => a.status === apptSubTab).length === 0 ? (
                <EmptyState
                  message={`No ${apptSubTab} appointments`}
                  subtitle={`You do not have any appointments logged with status "${apptSubTab}".`}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-[#51625C]">
                    <thead>
                      <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[9px] font-bold border-b border-[#DFE6E0]">
                        <th className="pb-3 px-3">Student</th>
                        <th className="pb-3 px-3">Date</th>
                        <th className="pb-3 px-3">Time slot</th>
                        <th className="pb-3 px-3">Reason / Details</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBF0EC]">
                      {appointments.filter(a => a.status === apptSubTab).map((appt) => (
                        <tr key={appt._id} className="hover:bg-[#FBFAF7] transition">
                          <td className="py-3.5 px-3">
                            <button
                              onClick={() => handleOpenStudentHistory(appt.userId?._id)}
                              className="text-left hover:underline focus:outline-none"
                              title="Click to view student history"
                            >
                              <div className="font-bold text-[#152420] text-sm">{appt.userId?.name || "Student"}</div>
                              <div className="text-[10px] text-[#8A9A94] font-medium mt-0.5">{appt.userId?.email}</div>
                            </button>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-[#152420]">
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-3 font-mono">
                            {appt.startTime} - {appt.endTime}
                          </td>
                          <td className="py-3.5 px-3 max-w-[200px] truncate" title={appt.reason}>
                            {appt.reason || "Counselling Appointment"}
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-1.5">
                            {apptSubTab === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(appt._id, "confirmed")}
                                  disabled={updatingId !== null}
                                  className="px-2.5 py-1.5 bg-[#1F6F5C] hover:bg-[#134A3D] text-white rounded-lg font-bold transition disabled:bg-[#8A9A94]"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusChange(appt._id, "rejected")}
                                  disabled={updatingId !== null}
                                  className="px-2.5 py-1.5 bg-[#F7E9E5] text-[#B25848] border border-[#EAD3CD] hover:bg-[#F2DCD7] rounded-lg font-bold transition disabled:bg-[#8A9A94]"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {apptSubTab === "confirmed" && (
                              <button
                                onClick={() => setCompletingAppt(appt)}
                                className="px-3 py-1.5 bg-[#1F6F5C] hover:bg-[#134A3D] text-white rounded-lg font-bold transition"
                              >
                                Complete Session
                              </button>
                            )}

                            {(apptSubTab === "completed" || apptSubTab === "cancelled" || apptSubTab === "rejected") && (
                              <span className="text-[10px] uppercase font-bold text-[#8A9A94] bg-[#FBFAF7] border px-2.5 py-1 rounded-md">
                                Archived Log
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================================================
             3. SCHEDULE & AVAILABILITY PANEL
        ================================================================== */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Create form */}
            <div className="lg:col-span-1 bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm self-start">
              <h2 className="text-base font-bold font-serif text-[#152420] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1F6F5C]" />
                Add Availability Slot
              </h2>

              <form onSubmit={handleAddScheduleSlot} className="space-y-4 text-xs font-semibold text-[#51625C]">
                <div>
                  <label className="block mb-1.5">Schedule Date</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    required
                    className="w-full border border-[#DFE6E0] rounded-lg p-2 focus:outline-none focus:border-[#1F6F5C] bg-[#FBFAF7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      required
                      className="w-full border border-[#DFE6E0] rounded-lg p-2 focus:outline-none focus:border-[#1F6F5C] bg-[#FBFAF7]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      required
                      className="w-full border border-[#DFE6E0] rounded-lg p-2 focus:outline-none focus:border-[#1F6F5C] bg-[#FBFAF7]"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingSchedule}
                    className="w-full py-2.5 bg-[#1F6F5C] hover:bg-[#134A3D] text-white rounded-xl transition flex items-center justify-center gap-2 disabled:bg-[#8A9A94] text-xs font-bold"
                  >
                    {savingSchedule ? "Generating..." : "Generate Availability Slot"}
                  </button>
                </div>
              </form>
            </div>

            {/* List panel */}
            <div className="lg:col-span-2 bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold font-serif text-[#152420] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1F6F5C]" />
                Allocated Availability Slots
              </h2>

              {schedules.length === 0 ? (
                <EmptyState
                  message="No availability slots logged"
                  subtitle="Configure date and times in the generator panel."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schedules.map((slot) => (
                    <div key={slot._id} className="border border-[#DFE6E0] rounded-xl p-4 bg-[#FBFAF7] flex flex-col justify-between space-y-4 hover:border-[#7C9885] transition">
                      <div className="flex justify-between items-start">
                        <div className="bg-white p-2 border border-[#DFE6E0] rounded-lg text-[#1F6F5C]">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          slot.isAvailable
                            ? "bg-[#E6F1EC] text-[#1B5B4A] border-[#D3E8DF]"
                            : "bg-[#E7EFF4] text-[#2E5D7C] border-[#B9D0E0]"
                        }`}>
                          {slot.isAvailable ? "Open" : "Booked / Closed"}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#152420]">
                          {new Date(slot.date).toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </h4>
                        <p className="text-[11px] text-[#51625C] font-semibold font-mono mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8A9A94]" />
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>

                      {slot.isAvailable && (
                        <div className="pt-2 border-t border-[#DFE6E0] flex justify-end">
                          <button
                            onClick={() => handleDeleteScheduleSlot(slot._id)}
                            className="text-[#B25848] bg-[#F7E9E5] hover:bg-[#F2DCD7] border border-[#EAD3CD] p-1.5 rounded-lg transition inline-flex items-center"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* =================================================================
             4. REVIEWS & RATINGS PANEL
        ================================================================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6">

            {/* Summary cards & charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Overall Ratings */}
              <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm flex items-center gap-6">
                <div className="text-center shrink-0">
                  <div className="font-serif text-4xl font-bold text-[#152420] leading-none">{avgRating}</div>
                  <div className="mt-2.5">{renderStars(parseFloat(avgRating))}</div>
                  <p className="text-[10px] text-[#8A9A94] uppercase tracking-wider font-bold mt-1.5">Based on {reviews.length} reviews</p>
                </div>

                <div className="w-px self-stretch bg-[#DFE6E0]" />

                <div className="flex-1 flex flex-col gap-1.5 text-xs text-[#51625C] font-semibold">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = getStarRatingCount(stars);
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-3">{stars}</span>
                        <div className="flex-1 h-2 bg-[#EBF0EC] rounded-full overflow-hidden">
                          <div className="bg-[#B8903E] h-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[#8A9A94] text-[10px]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stat breakdowns */}
              <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm md:col-span-2 grid grid-cols-3 gap-4">
                <div className="flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8A9A94] font-bold uppercase tracking-wider block">5-Star Rate</span>
                    <span className="font-serif text-2xl font-bold text-[#152420] mt-1 block">
                      {reviews.length > 0 ? ((getStarRatingCount(5) / reviews.length) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#FBF3E1] text-[#B8903E] flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8A9A94] font-bold uppercase tracking-wider block">Total Reviews</span>
                    <span className="font-serif text-2xl font-bold text-[#152420] mt-1 block">{reviews.length}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#E7EFF4] text-[#4E7FA0] flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8A9A94] font-bold uppercase tracking-wider block">This Month</span>
                    <span className="font-serif text-2xl font-bold text-[#152420] mt-1 block">
                      {reviews.filter(r => new Date(r.createdAt || new Date()).getMonth() === new Date().getMonth()).length}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Filter chips & reviews list */}
            <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h3 className="font-serif font-bold text-sm text-[#152420]">Student Reviews Log</h3>

                <div className="flex gap-1.5 flex-wrap">
                  {["all", "5", "4", "3", "2", "1"].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setReviewsFilter(stars)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                        reviewsFilter === stars
                          ? "bg-[#1F6F5C] text-white border-[#1F6F5C]"
                          : "bg-white text-[#51625C] border-[#DFE6E0] hover:bg-[#FBFAF7]"
                      }`}
                    >
                      {stars === "all" ? "All Stars" : `${stars} ★`}
                    </button>
                  ))}
                </div>
              </div>

              {reviews.filter(r => reviewsFilter === "all" || r.rating === parseInt(reviewsFilter)).length === 0 ? (
                <EmptyState
                  message="No matching reviews found"
                  subtitle="Student feedback will appear here after students submit reviews."
                />
              ) : (
                <div className="space-y-4">
                  {reviews.filter(r => reviewsFilter === "all" || r.rating === parseInt(reviewsFilter)).map((rev) => (
                    <div key={rev._id} className="border border-[#DFE6E0] rounded-xl p-4 bg-[#FBFAF7] hover:border-[#7C9885] transition">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#DFE6E0] text-[#51625C] flex items-center justify-center font-bold text-xs">
                            ?
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#152420]">Anonymous Student</div>
                            <div className="text-[10px] text-[#8A9A94] mt-0.5">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Counselling Interaction"}
                            </div>
                          </div>
                        </div>
                        {renderStars(rev.rating)}
                      </div>
                      <p className="text-xs text-[#51625C] leading-relaxed mt-3 whitespace-pre-wrap font-medium">
                        "{rev.comment || "No written review text provided."}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* =================================================================
             5. COUNSELLOR PROFILE PANEL
        ================================================================== */}
        {activeTab === "profile" && (
          <div className="space-y-6">

            {/* Large Overview Card */}
            <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center text-2xl font-bold font-serif shadow-sm shrink-0">
                {getCounsellorInitials(profile?.name || "Sara Mathew")}
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="font-serif font-bold text-xl text-[#152420]">{getCounsellorDisplayName(profile?.name || "Sara Mathew")}</h3>
                <p className="text-xs text-[#51625C] font-semibold mt-1">
                  {counsellorDetails?.specialization || "Wellness Counsellor Specialties"} · Wellness Team
                </p>
                <div className="flex gap-2 justify-center sm:justify-start flex-wrap mt-3 text-[10px] font-bold">
                  <span className="inline-flex px-2 py-0.5 bg-[#E6F1EC] text-[#1F6F5C] rounded-full border border-[#D3E8DF]">
                    Anxiety Support
                  </span>
                  <span className="inline-flex px-2 py-0.5 bg-[#E6F1EC] text-[#1F6F5C] rounded-full border border-[#D3E8DF]">
                    Academic Stress
                  </span>
                  <span className="inline-flex px-2 py-0.5 bg-[#E6F1EC] text-[#1F6F5C] rounded-full border border-[#D3E8DF]">
                    Mindfulness
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-[#DFE6E0] pt-4 sm:pt-0 sm:pl-6">
                <div className="text-[#B8903E] text-lg font-bold flex items-center gap-1 justify-center sm:justify-end">
                  <Star className="w-5 h-5 fill-current" /> {avgRating}
                </div>
                <p className="text-[10px] text-[#8A9A94] uppercase tracking-wider font-bold mt-1.5">{reviews.length} Student Reviews</p>
              </div>
            </div>

            {/* Profile Grid splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#152420] border-b pb-2 mb-3">About &amp; Credentials</h3>

                <div className="space-y-3 text-xs font-medium text-[#51625C]">
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Account Role</span>
                    <p className="text-[#152420] font-bold text-sm mt-1 capitalize">{profile?.role || "Counsellor"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Department</span>
                    <p className="text-[#152420] font-bold text-sm mt-1">{profile?.department || "Student Wellness Desk"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Qualifications</span>
                    <p className="text-[#152420] font-bold text-sm mt-1">M.Phil Psychology &amp; RCI Certified Practitioner</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-sm text-[#152420] border-b pb-2 mb-3">Professional Desk Info</h3>

                <div className="space-y-3 text-xs font-medium text-[#51625C]">
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Contact Number / Location</span>
                    <p className="text-[#152420] font-bold text-sm mt-1">{counsellorDetails?.contactNumber || "Wellness Center Cabin 2B"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Languages</span>
                    <p className="text-[#152420] font-bold text-sm mt-1">English, Hindi, Regional Languages</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A9A94] block uppercase font-bold tracking-wider">Consultation mode</span>
                    <p className="text-[#152420] font-bold text-sm mt-1">Online &amp; In-Person Slots</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Profile Action footer */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleOpenEditProfile}
                className="px-5 py-2.5 bg-[#1F6F5C] hover:bg-[#134A3D] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Edit Account Details
              </button>
            </div>

          </div>
        )}

      </div>

      {/* =================================================================
           6. COMPLETION MODAL & FEEDBACK POPUPS
      ================================================================== */}

      {/* Complete session modal */}
      {completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#DFE6E0] p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold font-serif text-[#152420]">Complete Counselling Session</h3>
                <p className="text-xs text-[#8A9A94] mt-1">Conclude the scheduled counselling appointment.</p>
              </div>
              <button
                onClick={() => setCompletingAppt(null)}
                className="text-[#8A9A94] hover:text-[#51625C] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4 text-xs space-y-2 text-[#51625C] font-semibold">
              <div>
                <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Student Name</span>
                <span className="text-[#152420] font-bold text-sm">{completingAppt.userId?.name || "Student"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#DFE6E0]">
                <div>
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Date</span>
                  <span className="text-[#51625C]">{new Date(completingAppt.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Time Slot</span>
                  <span className="text-[#51625C] font-mono">{completingAppt.startTime} - {completingAppt.endTime}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-[#DFE6E0]">
                <span className="text-[9px] text-[#8A9A94] block uppercase font-bold tracking-wider">Reason for Booking</span>
                <span className="text-[#51625C]">{completingAppt.reason || "N/A"}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#51625C] mb-1.5">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Enter notes about the counselling session..."
                  rows={4}
                  className="w-full border border-[#DFE6E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingAppt(null)}
                  className="w-1/2 border border-[#DFE6E0] text-[#51625C] hover:bg-[#FBFAF7] py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completingLoading}
                  className="w-1/2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-[#8A9A94]"
                >
                  {completingLoading ? "Saving..." : "Complete Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session details modal */}
      {viewingSessionObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#DFE6E0] overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center bg-[#FBFAF7] border-b border-[#DFE6E0] px-6 py-4">
              <h3 className="font-bold font-serif text-[#152420] text-base">Counselling Session Details</h3>
              <button
                onClick={() => setViewingSessionObj(null)}
                className="text-[#8A9A94] hover:text-[#51625C] text-lg font-bold p-1 rounded-lg hover:bg-[#EBF0EC]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs font-medium text-[#51625C]">
              <div>
                <h4 className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider mb-2">Student Information</h4>
                <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4 space-y-1">
                  <p className="font-bold text-[#152420] text-sm">{viewingSessionObj.userId?.name || "N/A"}</p>
                  <p className="text-[#8A9A94] font-medium">{viewingSessionObj.userId?.email || "N/A"}</p>
                  <p className="text-[#51625C]">Department: {viewingSessionObj.userId?.department || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4">
                  <p className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider">Appointment Date</p>
                  <p className="font-bold text-[#152420] mt-1">
                    {new Date(viewingSessionObj.appointmentId?.appointmentDate || viewingSessionObj.sessionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4">
                  <p className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider">Time Slot</p>
                  <p className="font-bold text-[#152420] mt-1 font-mono">
                    {viewingSessionObj.appointmentId?.startTime || "N/A"} - {viewingSessionObj.appointmentId?.endTime || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider mb-2">Reason for Appointment</h4>
                <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4 text-[#152420] leading-relaxed">
                  {viewingSessionObj.reason || "N/A"}
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider mb-2">Session Notes</h4>
                <div className="bg-[#FBFAF7] rounded-xl border border-[#DFE6E0] p-4 text-[#152420] leading-relaxed whitespace-pre-wrap">
                  {viewingSessionObj.notes || "No notes recorded."}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[9px] font-bold text-[#8A9A94] uppercase tracking-wider">Counsellor Guidance</h4>
                  {viewingSessionObj.feedbackSent && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E6F1EC] text-[#1B5B4A] border border-[#D3E8DF]">
                      <span className="w-1 h-1 rounded-full bg-[#1F6F5C]" />
                      Guidance Sent to Student
                    </span>
                  )}
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter counsellor guidance, recommendations, coping strategies, or exercises here..."
                  rows={4}
                  className="w-full border border-[#DFE6E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7] font-medium"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={async () => {
                      if (!feedbackText.trim()) {
                        toast.error("Please enter guidance text");
                        return;
                      }
                      try {
                        setFeedbackLoading(true);
                        await sendFeedback(viewingSessionObj._id, feedbackText.trim());
                        toast.success("Guidance Sent to Student");

                        // Save fallback to localStorage
                        try {
                          const fallbackGuidance = JSON.parse(localStorage.getItem("fallback_guidance") || "[]");
                          const filtered = fallbackGuidance.filter(g => g.sessionId !== viewingSessionObj._id);
                          filtered.push({
                            sessionId: viewingSessionObj._id,
                            appointmentId: viewingSessionObj.appointmentId?._id || viewingSessionObj.appointmentId,
                            studentId: viewingSessionObj.userId?._id || viewingSessionObj.userId,
                            feedback: feedbackText.trim(),
                            feedbackSent: true,
                            counsellorName: profile?.name || "Dr. Anu",
                            date: new Date()
                          });
                          localStorage.setItem("fallback_guidance", JSON.stringify(filtered));
                        } catch (err) {
                          console.warn(err);
                        }

                        setViewingSessionObj(prev => ({
                          ...prev,
                          feedback: feedbackText.trim(),
                          feedbackSent: true
                        }));
                        fetchData();
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
                onClick={() => setViewingSessionObj(null)}
                className="bg-[#152420] hover:bg-[#134A3D] text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback submission modal */}
      {feedbackSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#DFE6E0] p-6 space-y-4 animate-scale-up">
            <h3 className="font-bold font-serif text-[#152420] text-base">Send Counsellor Guidance</h3>
            <p className="text-xs text-[#8A9A94]">Provide session guidance for <strong className="text-[#152420]">{feedbackSession.userId?.name || "Student"}</strong>.</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#51625C] mb-2">
                  Counsellor Guidance
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter guidance details to help the student..."
                  rows={5}
                  className="w-full border border-[#DFE6E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackSession(null)}
                  className="w-1/2 border border-[#DFE6E0] text-[#51625C] hover:bg-[#FBFAF7] py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-1/2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-[#8A9A94]"
                >
                  {feedbackLoading ? "Sending..." : "Send Guidance to Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student History Modal */}
      {viewingStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#DFE6E0] overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center bg-[#FBFAF7] border-b border-[#DFE6E0] px-6 py-4">
              <div>
                <h3 className="font-bold font-serif text-[#152420] text-base">Student Session History</h3>
                <p className="text-xs text-[#8A9A94]">History with <strong className="text-[#152420]">{viewingStudentHistory.student?.name || "Student"}</strong></p>
              </div>
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="text-[#8A9A94] hover:text-[#51625C] text-lg font-bold p-1 rounded-lg hover:bg-[#EBF0EC]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs font-medium text-[#51625C]">
              <div className="flex items-center justify-between border-b border-[#DFE6E0] pb-3">
                <span className="font-bold text-[#8A9A94]">Total Sessions:</span>
                <span className="text-xs font-bold text-[#1F6F5C] bg-[#E6F1EC] px-2.5 py-0.5 rounded-full border border-[#D3E8DF]">
                  {viewingStudentHistory.totalSessions || 0}
                </span>
              </div>

              {viewingStudentHistory.sessions?.length === 0 ? (
                <p className="text-xs text-[#8A9A94] italic text-center py-6">No session history found for this student.</p>
              ) : (
                <div className="space-y-4">
                  {viewingStudentHistory.sessions.map((sess) => (
                    <div key={sess._id} className="border border-[#DFE6E0] rounded-xl p-4 bg-[#FBFAF7] space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#8A9A94]">
                        <span>Date: {new Date(sess.sessionDate).toLocaleDateString()}</span>
                        {sess.feedbackSent ? (
                          <span className="text-[#1B5B4A] bg-[#E6F1EC] px-2 py-0.5 rounded-full border border-[#D3E8DF]">Feedback Sent</span>
                        ) : (
                          <span className="text-[#8A9A94] bg-[#EBF0EC] px-2 py-0.5 rounded-full border">Pending Feedback</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] text-[#8A9A94] block font-bold uppercase tracking-wider">Reason</span>
                        <p className="text-xs text-[#152420] mt-0.5">{sess.reason || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#8A9A94] block font-bold uppercase tracking-wider">Session Notes</span>
                        <p className="text-xs text-[#152420] mt-0.5 whitespace-pre-wrap">{sess.notes || "No notes recorded."}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#FBFAF7] border-t border-[#DFE6E0] px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewingStudentHistory(null)}
                className="bg-[#152420] hover:bg-[#134A3D] text-white px-5 py-2 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Form Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#DFE6E0] p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold font-serif text-[#152420]">Edit Profile Details</h3>
                <p className="text-xs text-[#8A9A94] mt-1">Update your general identity parameters on the directory.</p>
              </div>
              <button
                onClick={() => setEditingProfile(false)}
                className="text-[#8A9A94] hover:text-[#51625C] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-[#51625C]">
              <div>
                <label className="block mb-1.5">Profile Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="Enter full name"
                  className="w-full border border-[#DFE6E0] rounded-xl p-2.5 focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                />
              </div>

              <div>
                <label className="block mb-1.5">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  placeholder="Enter department name"
                  className="w-full border border-[#DFE6E0] rounded-xl p-2.5 focus:outline-none focus:border-[#1F6F5C] text-[#152420] bg-[#FBFAF7]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="w-1/2 border border-[#DFE6E0] text-[#51625C] hover:bg-[#FBFAF7] py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-1/2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white py-2.5 rounded-xl text-xs font-bold transition disabled:bg-[#8A9A94]"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CounsellorDashboard;
