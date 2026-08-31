import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  CalendarCheck,
  Wrench,
  Star,
  History,
  Info,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Award,
  ClipboardList
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";
import Button from "../components/Button";
import InputField from "../components/InputField";

import { getUserProfile, updateUserProfile } from "../services/userApi";
import { getAllSchedules } from "../services/scheduleApi";
import { getMyAppointments, createAppointment, cancelMyAppointment } from "../services/appointmentApi";
import { createFacilityRequest } from "../services/facilityRequestApi";
import { createReview } from "../services/reviewApi";
import { getStudentSessionHistory } from "../services/sessionApi";
import { getMyResults } from "../services/assessmentApi";
import { getCounsellorDisplayName } from "../utils/nameHelper";

const StudentDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || "dashboard";

  // State
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assessmentsHistory, setAssessmentsHistory] = useState([]);
  const [selectedMood, setSelectedMood] = useState("okay");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile update form state
  const [profileName, setProfileName] = useState("");
  const [profileDept, setProfileDept] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Booking Modal State
  const [bookingSlot, setBookingSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Facility Request Form State
  const [reqTitle, setReqTitle] = useState("");
  const [reqCategory, setReqCategory] = useState("other");
  const [reqLocation, setReqLocation] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);

  // Feedback/Review States
  const [reviewingAppt, setReviewingAppt] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedApptIds, setReviewedApptIds] = useState(new Set());

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const profileRes = await getUserProfile();
      setProfile(profileRes.data.user);
      setProfileName(profileRes.data.user.name);
      setProfileDept(profileRes.data.user.department || "");

      // Fetch schedules
      const scheduleRes = await getAllSchedules();
      setSchedules(scheduleRes.data.schedules || []);

      // Fetch appointments
      const appointmentRes = await getMyAppointments();
      setAppointments(appointmentRes.data.appointments || []);

      // Fetch student session history (catch error silently in case student is not authorized yet)
      let sessionList = [];
      try {
        const sessionRes = await getStudentSessionHistory();
        sessionList = sessionRes.data.sessions || [];
      } catch (sessErr) {
        console.warn("Failed to load student sessions from backend:", sessErr);
        // Fallback: load from localStorage if present for local manual testing flows
        try {
          const fallbackGuidance = JSON.parse(localStorage.getItem("fallback_guidance") || "[]");
          const studentGuidance = fallbackGuidance.filter(g => g.studentId === profileRes.data.user._id);
          sessionList = studentGuidance.map(g => ({
            _id: g.sessionId,
            appointmentId: g.appointmentId,
            feedback: g.feedback,
            feedbackSent: g.feedbackSent,
            counsellorId: {
              name: g.counsellorName
            },
            sessionDate: g.date
          }));
        } catch (localErr) {
          console.warn("Failed to parse fallback guidance:", localErr);
        }
      }
      setSessions(sessionList);

      // Fetch assessments results history
      try {
        const historyRes = await getMyResults();
        setAssessmentsHistory(historyRes.data.results || []);
      } catch (assErr) {
        console.warn("Failed to load assessments history:", assErr);
      }

    } catch (err) {
      console.error("Error loading student dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard details. Please verify your connection.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Profile Submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await updateUserProfile({ name: profileName, department: profileDept });
      setProfile(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Open booking slot modal
  const startBooking = (slot) => {
    setBookingSlot(slot);
    setReason("Stress Management"); // Default common reason
    setNotes("");
  };

  // Submit appointment booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingSlot) return;

    try {
      setSubmittingBooking(true);

      // Determine counsellor ID from slot
      // Slot counsellor is populated.
      const counsellorId = bookingSlot.counsellor._id;

      const payload = {
        counsellorId,
        scheduleId: bookingSlot._id,
        reason,
        notes
      };

      await createAppointment(payload);
      toast.success("Appointment booked successfully!");

      setBookingSlot(null);
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Cancel own appointment
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await cancelMyAppointment(apptId);
      toast.success("Appointment cancelled successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // Submit Facility Request
  const handleSubmitFacilityRequest = async (e) => {
    e.preventDefault();
    if (!reqTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!reqLocation.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!reqDescription.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setSubmittingReq(true);
      const payload = {
        title: reqTitle.trim(),
        category: reqCategory,
        location: reqLocation.trim(),
        description: reqDescription.trim()
      };
      await createFacilityRequest(payload);
      toast.success("Facility request submitted successfully!");

      // Reset form
      setReqTitle("");
      setReqCategory("other");
      setReqLocation("");
      setReqDescription("");
    } catch (err) {
      console.error("Facility Request submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit facility request");
    } finally {
      setSubmittingReq(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingAppt) return;
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        appointmentId: reviewingAppt._id,
        rating,
        comment: reviewComment.trim()
      };
      await createReview(payload);
      toast.success("Feedback submitted anonymously. Thank you!");

      // Track reviewed appointment in local state
      setReviewedApptIds(prev => {
        const next = new Set(prev);
        next.add(reviewingAppt._id);
        return next;
      });

      // Reset & close
      setReviewingAppt(null);
      setRating(5);
      setReviewComment("");

      // Refresh dashboard data
      fetchData();
    } catch (err) {
      console.error("Submit review error:", err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper: Extract unique counsellor from schedules or appointments list
  const getCounsellorDetails = () => {
    // 1. Try from schedules
    const scheduleWithCounsellor = schedules.find(s => s.counsellor && s.counsellor.user);
    if (scheduleWithCounsellor) {
      const c = scheduleWithCounsellor.counsellor;
      return {
        name: getCounsellorDisplayName(c.user?.name || "College Counsellor"),
        email: c.user?.email || "wellness@college.edu",
        specialization: c.specialization || "Wellness & Mental Support",
        contactNumber: c.contactNumber || "N/A",
        exists: true
      };
    }

    // 2. Try from appointments
    const apptWithCounsellor = appointments.find(a => a.counsellorId);
    if (apptWithCounsellor && apptWithCounsellor.counsellorId) {
      const c = apptWithCounsellor.counsellorId;
      return {
        name: getCounsellorDisplayName(c.name || "College Counsellor"),
        email: c.email || "wellness@college.edu",
        specialization: c.specialization || "Student Support & Counselling",
        contactNumber: c.contactNumber || "N/A",
        exists: true
      };
    }

    // 3. Fallback default
    return {
      name: "Wellness Cell Counsellor",
      email: "counselling@college.edu",
      specialization: "Clinical Psychology & Academic Stress Support",
      contactNumber: "Wellness Centre - Admin Desk",
      exists: false
    };
  };

  const getCounsellorNameForAppointment = (appt) => {
    if (appt.counsellorId?.user?.name) {
      return getCounsellorDisplayName(appt.counsellorId.user.name);
    }
    const cid = appt.counsellorId?._id || appt.counsellorId;
    if (cid) {
      const matchedSlot = schedules.find(s => s.counsellor?._id === cid || s.counsellor === cid);
      if (matchedSlot?.counsellor?.user?.name) {
        return getCounsellorDisplayName(matchedSlot.counsellor.user.name);
      }
    }
    return appt.counsellorId?.name
      ? getCounsellorDisplayName(appt.counsellorId.name)
      : "Wellness Counsellor";
  };

  const counsellor = getCounsellorDetails();

  // Statistics Computations
  const activeSchedulesCount = schedules.filter(s => s.isAvailable).length;
  const upcomingAppointmentsCount = appointments.filter(
    a => a.status === "pending" || a.status === "confirmed"
  ).length;
  const completedAppointmentsCount = appointments.filter(a => a.status === "completed").length;

  const isProfileComplete = profile?.name && profile?.email && profile?.department;
  const profileStatusText = isProfileComplete ? "Complete" : "Incomplete";

  if (loading) {
    return (
      <DashboardLayout role="student" user={profile}>
        <LoadingState message="Loading your student wellness profile..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="student" user={profile}>
        <ErrorState message={error} onRetry={fetchData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" user={profile}>
      <div className="space-y-8 animate-fade-in">

        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Student Portal</span>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {activeTab === "dashboard" && "Wellness Dashboard"}
              {activeTab === "profile" && "Student Profile Settings"}
              {activeTab === "appointments" && "Your Counselling Sessions"}
              {activeTab === "schedule" && "Available Slot Bookings"}
              {activeTab === "facility-requests" && "Facility Support Request"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "dashboard" && "Take care of your mind. Book slots or check appointments."}
              {activeTab === "profile" && "Keep your profile name and department information current."}
              {activeTab === "appointments" && "View status logs and manage upcoming or past interactions."}
              {activeTab === "schedule" && "Select a day and time slot with the student counsellor."}
              {activeTab === "facility-requests" && "Submit a report for campus maintenance or room concerns."}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/student"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "dashboard" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Dashboard Overview
            </Link>
            <Link
              to="/student/schedule"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "schedule" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Book Slots
            </Link>
          </div>
        </div>

        {/* ------------------- DASHBOARD OVERVIEW TAB ------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* 1. WELCOME + MOOD CHECK-IN */}
            <div className="bg-gradient-to-br from-[#E6F1EC] to-white border border-[#D3E8DF] rounded-[22px] p-8 text-left mb-6">
              <h2 className="font-serif text-2xl font-bold text-[#152420]">
                Good morning, {profile?.name || "Student"} 🌤️
              </h2>
              <p className="text-[#51625C] text-sm mt-1.5 font-medium">How are you feeling today?</p>

              <div className="flex gap-2.5 flex-wrap mt-4">
                {[
                  { id: "great", label: "Great", color: "text-[#2E9276]" },
                  { id: "good", label: "Good", color: "text-[#4E7FA0]" },
                  { id: "okay", label: "Okay", color: "text-[#B8903E]" },
                  { id: "stressed", label: "Stressed", color: "text-[#B2733F]" },
                  { id: "low", label: "Low", color: "text-[#B25848]" }
                ].map((m) => {
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMood(m.id)}
                      className={`flex flex-col items-center gap-1.5 px-4.5 py-3 rounded-2xl border text-xs font-semibold min-w-[82px] transition ${
                        isSelected
                          ? "bg-[#1F6F5C] text-white border-[#1F6F5C]"
                          : "bg-white border-[#DFE6E0] text-[#51625C] hover:border-[#D3E8DF]"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isSelected ? "stroke-white" : "stroke-current " + m.color}`} fill="none" strokeWidth="2">
                        {m.id === "great" && <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>}
                        {m.id === "good" && <><circle cx="12" cy="12" r="9"/><path d="M8 13.5s1.5 1.5 4 1.5 4-1.5 4-1.5M9 9h.01M15 9h.01"/></>}
                        {m.id === "okay" && <><circle cx="12" cy="12" r="9"/><path d="M8 14h8M9 9h.01M15 9h.01"/></>}
                        {m.id === "stressed" && <><circle cx="12" cy="12" r="9"/><path d="M8 15.5s1.5-1.5 4-1.5 4 1.5 4 1.5M9 9.5l1.5 1M15 9.5l-1.5 1"/></>}
                        {m.id === "low" && <><circle cx="12" cy="12" r="9"/><path d="M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"/></>}
                      </svg>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. QUICK ACTIONS */}
            <div className="text-left mb-4">
              <h3 className="font-serif text-base font-bold text-[#152420]">Quick actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
              <Link to="/student/assessments" className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#E7EFF4] text-[#4E7FA0] flex items-center justify-center mb-3">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#152420] group-hover:text-[#1F6F5C]">Take Self Assessment</h4>
                <p className="text-xs text-[#8A9A94] mt-1.5 leading-relaxed">A short check-in to understand how you're really doing.</p>
              </Link>

              <Link to="/student/chatbot" className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#152420] group-hover:text-[#1F6F5C]">Chat with AI Assistant</h4>
                <p className="text-xs text-[#8A9A94] mt-1.5 leading-relaxed">Talk through stress or worries any time, day or night.</p>
              </Link>

              <Link to="/student/schedule" className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#EEEAF6] text-[#7A6BA6] flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#152420] group-hover:text-[#1F6F5C]">Book a Counselling Session</h4>
                <p className="text-xs text-[#8A9A94] mt-1.5 leading-relaxed">Speak with a professional counsellor at a time that suits you.</p>
              </Link>

              <Link to="/resources" className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#FBF3E1] text-[#B8903E] flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#152420] group-hover:text-[#1F6F5C]">Explore Resources</h4>
                <p className="text-xs text-[#8A9A94] mt-1.5 leading-relaxed">Guides and exercises for stress, sleep and focus.</p>
              </Link>
            </div>

            {/* 3. WELLNESS OVERVIEW */}
            <div className="text-left mb-4">
              <h3 className="font-serif text-base font-bold text-[#152420]">Your wellness overview</h3>
            </div>
            {(() => {
              const latestAssessment = assessmentsHistory[0] || null;
              const latestScore = latestAssessment ? `${latestAssessment.totalScore || latestAssessment.score} / ${latestAssessment.maxScore || 100}` : "N/A";
              const latestLevel = latestAssessment ? latestAssessment.level : "Stable";
              const upcomingSessionsList = appointments.filter(a => a.status === "pending" || a.status === "confirmed");
              const sortedUpcoming = [...upcomingSessionsList].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
              const nextSession = sortedUpcoming[0] || null;

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
                    <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#152420] mt-1">{latestScore}</span>
                      <span className="text-xs text-[#8A9A94] font-medium">Latest assessment result</span>
                    </div>

                    <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#E7EFF4] text-[#4E7FA0] flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#152420] mt-1 capitalize">{latestLevel}</span>
                      <span className="text-xs text-[#8A9A94] font-medium">Current wellness level</span>
                      {latestAssessment && (
                        <span className="text-[10px] font-bold text-[#7C9885] mt-1 flex items-center gap-1">
                          ↑ Slightly better than last week
                        </span>
                      )}
                    </div>

                    <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#EEEAF6] text-[#7A6BA6] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-[14px] font-bold text-[#152420] mt-2 line-clamp-1">
                        {nextSession ? `${new Date(nextSession.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${nextSession.startTime}` : "No upcoming session"}
                      </span>
                      <span className="text-xs text-[#8A9A94] font-medium">Upcoming session</span>
                    </div>

                    <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FBF3E1] text-[#B8903E] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#152420] mt-1">{completedAppointmentsCount}</span>
                      <span className="text-xs text-[#8A9A94] font-medium">Completed sessions</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2-span) */}
                    <div className="lg:col-span-2 space-y-6 text-left">
                      {/* Upcoming Session Details Card */}
                      <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-serif text-[#152420] font-bold text-base">Upcoming session</h3>
                          {nextSession ? (
                            <span className={`badge uppercase tracking-wider text-[9px] font-extrabold ${
                              nextSession.status === "confirmed" ? "badge-confirmed" : "badge-pending"
                            }`}>
                              {nextSession.status}
                            </span>
                          ) : (
                            <span className="badge badge-pending uppercase tracking-wider text-[9px] font-extrabold">None Booked</span>
                          )}
                        </div>

                        {nextSession ? (
                          <>
                            <div className="flex items-center gap-3.5 mb-5">
                              <div className="w-11 h-11 rounded-full bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center font-bold text-sm font-serif">
                                {getCounsellorNameForAppointment(nextSession).replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-[#152420]">{getCounsellorNameForAppointment(nextSession)}</h4>
                                <span className="text-xs text-[#8A9A94] font-medium">{nextSession.reason || "Counselling Session"}</span>
                              </div>
                            </div>
                            <div className="divide-y divide-[#EBF0EC]">
                              <div className="flex justify-between py-2.5 text-xs">
                                <span className="text-[#8A9A94] font-medium">Date</span>
                                <span className="font-bold text-[#152420]">
                                  {new Date(nextSession.appointmentDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between py-2.5 text-xs">
                                <span className="text-[#8A9A94] font-medium">Time</span>
                                <span className="font-bold text-[#152420]">{nextSession.startTime} - {nextSession.endTime}</span>
                              </div>
                              <div className="flex justify-between py-2.5 text-xs">
                                <span className="text-[#8A9A94] font-medium">Session type</span>
                                <span className="font-bold text-[#152420]">{nextSession.reason || "N/A"}</span>
                              </div>
                              <div className="flex justify-between py-2.5 text-xs">
                                <span className="text-[#8A9A94] font-medium">Mode</span>
                                <span className="font-bold text-[#152420]">
                                  <span className="pill online">Online · Google Meet</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-3.5 mt-5">
                              <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="flex-1">
                                <button className="btn btn-primary btn-block text-xs font-semibold py-2.5 rounded-xl">Join Session</button>
                              </a>
                              <Link to="/student/appointments" className="flex-1">
                                <button className="btn btn-secondary btn-block text-xs font-semibold py-2.5 rounded-xl">View Details</button>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="py-6 text-center">
                            <p className="text-xs text-[#8A9A94] italic mb-4">You have no upcoming sessions scheduled.</p>
                            <Link to="/student/schedule">
                              <button className="btn btn-primary text-xs font-semibold py-2.5 px-6 rounded-xl">Book a Session</button>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* AI wellness assistant banner */}
                      <div className="bg-gradient-to-br from-[#134A3D] to-[#1F6F5C] text-white rounded-[22px] p-8 flex items-center gap-6 flex-wrap">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-[220px]">
                          <h4 className="font-serif text-lg font-bold">Need someone to talk to?</h4>
                          <p className="text-xs text-white/90 mt-1 leading-relaxed max-w-md">Our AI wellness assistant can help with everyday stress, study pressure and general wellbeing — any time you need it.</p>
                        </div>
                        <Link to="/student/chatbot" className="flex-shrink-0">
                          <button className="btn text-xs font-bold py-2.5 px-5 rounded-xl bg-white text-[#134A3D] hover:bg-[#F2F5F2] transition">Start Conversation</button>
                        </Link>
                      </div>

                      {/* Recommended Resources */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-serif text-[#152420] font-bold text-base">Recommended resources</h3>
                          <Link to="/resources" className="text-xs font-semibold text-[#1F6F5C] flex items-center gap-1 hover:underline">
                            View all
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                              <span className="pill text-[10px] font-semibold bg-[#E7EFF4] text-[#4E7FA0] border-transparent self-start">Article</span>
                              <h4 className="font-bold text-xs text-[#152420] mt-3">Stress Management</h4>
                              <p className="text-xs text-[#8A9A94] mt-1 leading-relaxed">Simple techniques to stay calm during busy weeks.</p>
                            </div>
                            <Link to="/resources" className="text-xs font-bold text-[#1F6F5C] mt-3 flex items-center gap-1 hover:underline">
                              View resource →
                            </Link>
                          </div>

                          <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                              <span className="pill text-[10px] font-semibold bg-[#EEEAF6] text-[#7A6BA6] border-transparent self-start">Guide</span>
                              <h4 className="font-bold text-xs text-[#152420] mt-3">Better Sleep</h4>
                              <p className="text-xs text-[#8A9A94] mt-1 leading-relaxed">A wind-down routine to help you fall asleep faster.</p>
                            </div>
                            <Link to="/resources" className="text-xs font-bold text-[#1F6F5C] mt-3 flex items-center gap-1 hover:underline">
                              View resource →
                            </Link>
                          </div>

                          <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                              <span className="pill text-[10px] font-semibold bg-[#FBF3E1] text-[#B8903E] border-transparent self-start">Exercise</span>
                              <h4 className="font-bold text-xs text-[#152420] mt-3">Exam Anxiety</h4>
                              <p className="text-xs text-[#8A9A94] mt-1 leading-relaxed">Grounding exercises to use right before an exam.</p>
                            </div>
                            <Link to="/resources" className="text-xs font-bold text-[#1F6F5C] mt-3 flex items-center gap-1 hover:underline">
                              View resource →
                            </Link>
                          </div>

                          <div className="bg-white border border-[#DFE6E0] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                            <div>
                              <span className="pill text-[10px] font-semibold bg-[#E6F1EC] text-[#1F6F5C] border-transparent self-start">Guide</span>
                              <h4 className="font-bold text-xs text-[#152420] mt-3">Time Management</h4>
                              <p className="text-xs text-[#8A9A94] mt-1 leading-relaxed">A simple framework to balance study and rest.</p>
                            </div>
                            <Link to="/resources" className="text-xs font-bold text-[#1F6F5C] mt-3 flex items-center gap-1 hover:underline">
                              View resource →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (1-span) */}
                    <div className="space-y-6 text-left">
                      {/* Recent Assessment Card */}
                      <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                        <h3 className="font-serif text-[#152420] font-bold text-base mb-3">Recent assessment</h3>
                        {latestAssessment ? (
                          <>
                            <h4 className="font-bold text-[#152420] text-sm">{latestAssessment.title || "General Wellbeing Check-in"}</h4>
                            <span className="text-xs text-[#8A9A94] block mt-1">Completed {new Date(latestAssessment.createdAt).toLocaleDateString()}</span>
                            <div className="divide-y divide-[#EBF0EC] mt-4">
                              <div className="flex justify-between py-2 text-xs">
                                <span className="text-[#8A9A94] font-medium">Score</span>
                                <span className="font-bold text-[#152420]">{latestScore}</span>
                              </div>
                              <div className="flex justify-between py-2 text-xs">
                                <span className="text-[#8A9A94] font-medium">Wellness level</span>
                                <span className="font-bold text-[#1F6F5C] capitalize">{latestLevel}</span>
                              </div>
                            </div>
                            <Link to="/student/assessments" className="block mt-5">
                              <button className="btn btn-secondary btn-block text-xs font-semibold py-2.5 rounded-xl">View Details</button>
                            </Link>
                          </>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-xs text-[#8A9A94] italic mb-4">No assessments completed yet.</p>
                            <Link to="/student/assessments">
                              <button className="btn btn-secondary btn-block text-xs font-semibold py-2.5 rounded-xl">Take Assessment</button>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Counsellor Guidance Section */}
                      {(() => {
                        const guidanceSessions = sessions.filter(s => s.feedbackSent && s.feedback);
                        return (
                          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                            <h3 className="font-serif text-base font-bold text-slate-800 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-emerald-500" />
                              Counsellor Guidance
                              {guidanceSessions.length > 0 && (
                                <span className="ml-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider animate-pulse">
                                  New Guidance
                                </span>
                              )}
                            </h3>

                            {guidanceSessions.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No counsellor guidance yet.</p>
                            ) : (
                              (() => {
                                const sortedSessions = [...guidanceSessions].sort((a, b) => new Date(b.sessionDate || 0) - new Date(a.sessionDate || 0));
                                return (
                                  <div className="space-y-4">
                                    {sortedSessions.slice(0, 2).map((session) => {
                                      const rawName = session.counsellorId?.name || "Student Counsellor";
                                      const displayName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;
                                      const formattedDate = new Date(session.sessionDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      });

                                      return (
                                        <div key={session._id} className="bg-emerald-50/40 border border-emerald-400/20 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <div className="avatar" style={{ width: "24px", height: "24px", fontSize: "10px" }}>
                                                {displayName.replace("Dr. ", "").substring(0, 2).toUpperCase()}
                                              </div>
                                              <div>
                                                <h4 className="font-bold text-slate-800 text-xs">{displayName}</h4>
                                                <span className="text-[9px] text-[#8A9A94] block">{formattedDate}</span>
                                              </div>
                                            </div>
                                            <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-xl italic font-medium leading-relaxed">
                                              "{session.feedback}"
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <Link
                                      to="/student/appointments"
                                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline"
                                    >
                                      View All Guidance
                                      <ArrowRight className="w-3 h-3" />
                                    </Link>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        );
                      })()}

                      {/* Recent Activity Timeline Card */}
                      <div className="bg-white border border-[#DFE6E0] rounded-2xl p-6 shadow-sm">
                        <h3 className="font-serif text-[#152420] font-bold text-base mb-4">Recent activity</h3>
                        <div className="relative border-l-2 border-[#DFE6E0] ml-3.5 space-y-5">
                          {/* Item 1 */}
                          {latestAssessment && (
                            <div className="relative pl-6">
                              <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-[#2E9276] border-2 border-white shadow-sm" />
                              <div style={{ fontWeight: 600, fontSize: "13px" }}>Assessment completed</div>
                              <div className="text-[#8A9A94] text-[11px] font-medium mt-0.5">
                                {latestAssessment.title || "Check-in"} · {new Date(latestAssessment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          )}

                          {/* Item 2 */}
                          {nextSession && (
                            <div className="relative pl-6">
                              <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-[#7A6BA6] border-2 border-white shadow-sm" />
                              <div style={{ fontWeight: 600, fontSize: "13px" }}>Session booked</div>
                              <div className="text-[#8A9A94] text-[11px] font-medium mt-0.5">
                                With {getCounsellorNameForAppointment(nextSession)} · {new Date(nextSession.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          )}

                          {/* Item 3 */}
                          <div className="relative pl-6">
                            <span className="absolute -left-[30px] top-0 w-3.5 h-3.5 rounded-full bg-[#B8903E] border-2 border-white shadow-sm" />
                            <div style={{ fontWeight: 600, fontSize: "13px" }}>Resource viewed</div>
                            <div className="text-[#8A9A94] text-[11px] font-medium mt-0.5">"Better Sleep" guide</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ------------------- SCHEDULE / BOOK SLOTS TAB ------------------- */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5.5 h-5.5 text-emerald-500" />
              Book Counselling Availability Slots
            </h2>

            {schedules.filter(s => s.isAvailable).length === 0 ? (
              <EmptyState
                message="No open schedules at this time"
                subtitle="All slots are currently booked. Please check back later."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules
                  .filter(s => s.isAvailable)
                  .map((slot) => (
                    <div
                      key={slot._id}
                      className="border border-slate-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 transition flex flex-col justify-between bg-slate-50/50"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-slate-700">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            Available Slot
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-800 text-base">
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>

                        {slot.counsellor?.user && (
                          <div className="pt-2 border-t border-slate-200/50">
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Assigned to</span>
                            <span className="text-xs font-bold text-slate-700">{slot.counsellor.user.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        <button
                          onClick={() => startBooking(slot)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                        >
                          Book appointment
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------- APPOINTMENTS TAB ------------------- */}
        {activeTab === "appointments" && (
          <div className="space-y-8">

            {/* Section 1: Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                <CalendarCheck className="w-5.5 h-5.5 text-emerald-500" />
                Upcoming Booked Sessions
              </h2>

              {appointments.filter(a => a.status === "pending" || a.status === "confirmed").length === 0 ? (
                <EmptyState
                  message="No upcoming appointments scheduled"
                  subtitle="Use the Book Slots tab to coordinate a session with the counsellor."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Time</th>
                        <th className="pb-3 font-semibold">Counsellor</th>
                        <th className="pb-3 font-semibold">Reason</th>
                        <th className="pb-3 font-semibold text-center">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {appointments
                        .filter(a => a.status === "pending" || a.status === "confirmed")
                        .map((appt) => {
                          const statusColors = {
                            pending: "bg-amber-50 text-amber-700 border-amber-200",
                            confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200"
                          };

                          return (
                            <tr key={appt._id} className="hover:bg-slate-50/30 transition">
                              <td className="py-4 font-semibold text-slate-800">
                                {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </td>
                              <td className="py-4 text-slate-500 font-medium">
                                {appt.startTime} - {appt.endTime}
                              </td>
                              <td className="py-4 text-slate-600 font-medium">
                                {getCounsellorNameForAppointment(appt)}
                              </td>
                              <td className="py-4 max-w-xs truncate text-slate-600 font-medium" title={appt.reason}>
                                {appt.reason || "N/A"}
                              </td>
                              <td className="py-4 text-center">
                                <span className={`inline-flex border px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  statusColors[appt.status] || "bg-slate-50 text-slate-600"
                                }`}>
                                  {appt.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleCancelAppointment(appt._id)}
                                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Session History / Session History UI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                <History className="w-5.5 h-5.5 text-emerald-500" />
                Past & Completed Session History
              </h2>

              {appointments.filter(a => a.status === "completed" || a.status === "cancelled" || a.status === "rejected").length === 0 ? (
                <EmptyState
                  message="No past sessions found"
                  subtitle="Your completed sessions and cancel logs will display here."
                />
              ) : (
                <div className="space-y-4">
                  {appointments
                    .filter(a => a.status === "completed" || a.status === "cancelled" || a.status === "rejected")
                    .map((appt) => {
                      const statusColors = {
                        completed: "bg-purple-50 text-purple-700 border-purple-200",
                        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
                        rejected: "bg-rose-50 text-rose-700 border-rose-200"
                      };

                      const isReviewed = reviewedApptIds.has(appt._id);

                      return (
                        <div key={appt._id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50/20 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2.5 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-extrabold text-slate-800 text-sm">
                                {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {appt.startTime} - {appt.endTime}
                              </span>
                              <span className={`inline-flex border px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                statusColors[appt.status] || "bg-slate-50 text-slate-600"
                              }`}>
                                {appt.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Counsellor</span>
                                <span className="text-slate-700 font-bold">{getCounsellorNameForAppointment(appt)}</span>
                                {appt.counsellorId?.specialization && (
                                  <span className="text-slate-400 block text-[10px] mt-0.5">({appt.counsellorId.specialization})</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Reason for Session</span>
                                <span className="text-slate-700">{appt.reason || "N/A"}</span>
                              </div>
                            </div>

                            {/* Session notes where available */}
                            {appt.notes && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">Counsellor Session Notes</span>
                                <p className="leading-relaxed">{appt.notes}</p>
                              </div>
                            )}

                            {/* Counsellor Guidance where available */}
                            {(() => {
                              const matchingSession = sessions.find(
                                s => s.appointmentId === appt._id || s.appointmentId?._id === appt._id
                              );
                              if (matchingSession?.feedbackSent && matchingSession.feedback) {
                                return (
                                  <div className="bg-[#E6F1EC] p-4 rounded-xl border border-[#D3E8DF] text-xs text-[#134A3D] font-medium mt-3">
                                    <span className="text-[10px] text-[#1F6F5C] block font-bold uppercase tracking-wider mb-1">Counsellor Guidance</span>
                                    <p className="leading-relaxed whitespace-pre-wrap">"{matchingSession.feedback}"</p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          <div className="flex items-center self-end md:self-center gap-2">
                            {appt.status === "completed" && (
                              isReviewed ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Feedback Submitted
                                </span>
                              ) : (
                                <button
                                  onClick={() => setReviewingAppt(appt)}
                                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-sm shadow-emerald-600/10 hover:shadow-md transition inline-flex items-center gap-1.5"
                                >
                                  <Star className="w-4 h-4 fill-white" />
                                  Give Feedback
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ------------------- PROFILE UPDATE TAB ------------------- */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5.5 h-5.5 text-emerald-500" />
              Configure Profile Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <InputField
                label="Full Name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
              />

              <InputField
                label="Department"
                type="text"
                value={profileDept}
                onChange={(e) => setProfileDept(e.target.value)}
                placeholder="e.g. MCA, MSc Psychology, etc."
              />

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Email Address (Read-only)
                </label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-slate-500 text-sm font-medium">
                  {profile?.email}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  text={updatingProfile ? "Saving changes..." : "Save Settings"}
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-emerald-600 hover:bg-emerald-700"
                />
              </div>
            </form>
          </div>
        )}

        {/* ------------------- FACILITY REQUESTS TAB ------------------- */}
        {activeTab === "facility-requests" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wrench className="w-5.5 h-5.5 text-emerald-500" />
              Submit Campus Facility Request
            </h2>

            <form onSubmit={handleSubmitFacilityRequest} className="space-y-5">
              <InputField
                label="Request Title"
                type="text"
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="e.g. AC not cooling, fan making noise"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 px-4 text-[15px] font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                  >
                    <option value="air_conditioner">Air Conditioner</option>
                    <option value="fan">Ceiling / Table Fan</option>
                    <option value="lighting">Lighting & Bulbs</option>
                    <option value="furniture">Furniture / Desk / Chair</option>
                    <option value="room">Room / Venue Issue</option>
                    <option value="electrical">Electrical & Wiring</option>
                    <option value="cleanliness">Cleanliness & Sanitation</option>
                    <option value="other">Other Campus Issue</option>
                  </select>
                </div>

                <InputField
                  label="Location / Room"
                  type="text"
                  value={reqLocation}
                  onChange={(e) => setReqLocation(e.target.value)}
                  placeholder="e.g. Room 402, Block C"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  placeholder="Provide details about the issue so maintenance staff can troubleshoot..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl p-4 text-[15px] font-medium bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                />
              </div>

              <div className="pt-2">
                <Button
                  text={submittingReq ? "Submitting request..." : "Submit Facility Request"}
                  type="submit"
                  disabled={submittingReq}
                  className="bg-emerald-600 hover:bg-emerald-700 border-0"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ------------------- BOOKING CONFIRMATION MODAL ------------------- */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border p-6 space-y-5 animate-scale-up">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Confirm Counselling Booking</h3>
                <p className="text-xs text-slate-500 mt-1">Please provide a reason to coordinate your support session.</p>
              </div>
              <button
                onClick={() => setBookingSlot(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Calendar className="w-4.5 h-4.5 text-emerald-500" />
                {new Date(bookingSlot.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4.5 h-4.5 text-slate-400" />
                {bookingSlot.startTime} - {bookingSlot.endTime}
              </div>
              {bookingSlot.counsellor?.user && (
                <div className="pt-2 border-t border-slate-200/50 flex items-center gap-2 text-slate-600 text-xs">
                  <User className="w-4 h-4 text-slate-400" />
                  Counsellor: <strong className="text-slate-700">{bookingSlot.counsellor.user.name}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Reason for Counselling
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Academic Pressure">Academic Pressure / Stress</option>
                  <option value="Anxiety & Depressive thoughts">Anxiety / Depressive thoughts</option>
                  <option value="Personal / Family Issues">Personal / Family Issues</option>
                  <option value="Time Management / Sleep concern">Time Management / Sleep concerns</option>
                  <option value="Career & Goal guidance">Career & Goal Guidance</option>
                  <option value="Other Wellness consultation">Other Wellness Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Any details you wish to share beforehand..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="w-1/2 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:bg-gray-400"
                >
                  {submittingBooking ? "Booking..." : "Book Session"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------- REVIEW SESSION MODAL ------------------- */}
      {reviewingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border p-6 space-y-5 animate-scale-up">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Review Counselling Session</h3>
                <p className="text-xs text-slate-500 mt-1">Submit feedback for your session with <strong className="text-slate-700">{reviewingAppt.counsellorId?.name || "Counsellor"}</strong>.</p>
              </div>
              <button
                onClick={() => setReviewingAppt(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50/50 text-emerald-800 rounded-xl border border-emerald-100/50 text-[11px] font-semibold flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <strong>Strict Privacy Guarantee:</strong> This feedback is completely anonymous. The counsellor cannot identify which student submitted this review.
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Session Rating (Required)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-115 transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-slate-500 font-bold ml-2">({rating} / 5)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Comments / Suggestions (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about your experience to help the counsellor improve..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewingAppt(null)}
                  className="w-1/2 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:bg-slate-400 flex items-center justify-center gap-1"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default StudentDashboard;