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
  Wrench
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

const StudentDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || "dashboard";

  // State
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
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

  // Helper: Extract unique counsellor from schedules or appointments list
  const getCounsellorDetails = () => {
    // 1. Try from schedules
    const scheduleWithCounsellor = schedules.find(s => s.counsellor && s.counsellor.user);
    if (scheduleWithCounsellor) {
      const c = scheduleWithCounsellor.counsellor;
      return {
        name: c.user?.name || "College Counsellor",
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
        // Backend appointment populate is counsellorId -> "name email specialization contactNumber"
        // (even if backend has populate issues, let's fall back gracefully)
        name: c.name || "College Counsellor",
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
            {/* Wellness greeting banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-800">"Your mental health is a priority. Your happiness is an essential."</h3>
                <p className="text-sm text-slate-600 mt-1">The Counselling Cell provides a confidential, non-judgmental environment to navigate challenges.</p>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Upcoming Appointments"
                value={upcomingAppointmentsCount}
                subtitle="Booked active sessions"
                color="blue"
              />
              <StatCard
                title="Available Slots"
                value={activeSchedulesCount}
                subtitle="Open slots this week"
                color="green"
              />
              <StatCard
                title="Completed Sessions"
                value={completedAppointmentsCount}
                subtitle="Your completed journey"
                color="purple"
              />
              <StatCard
                title="Profile Status"
                value={profileStatusText}
                subtitle={profile?.department || "Dept not configured"}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Counsellor Profile Card */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Student Counsellor
                  </h2>

                  <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
                      {counsellor.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <h3 className="font-semibold text-slate-800 text-md">{counsellor.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {counsellor.exists ? "Official Counsellor" : "Fallback Desk"}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Specialization</span>
                      <span className="text-slate-700 font-medium">{counsellor.specialization}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Counselling Email</span>
                      <span className="text-slate-700 font-medium break-all">{counsellor.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Contact Desk</span>
                      <span className="text-slate-700 font-medium">{counsellor.contactNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <Link to="/student/schedule" className="w-full">
                    <Button text="Book Appointments" className="bg-emerald-600 hover:bg-emerald-700" />
                  </Link>
                  <p className="text-[11px] text-center text-slate-400">All discussions are fully private & confidential.</p>
                </div>
              </div>

              {/* Schedules Overview */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      Next Available Slots
                    </h2>
                    <Link to="/student/schedule" className="text-xs text-emerald-600 font-semibold hover:underline">
                      View all ({activeSchedulesCount})
                    </Link>
                  </div>

                  {schedules.filter(s => s.isAvailable).length === 0 ? (
                    <EmptyState 
                      message="No schedules available" 
                      subtitle="Check back later or contact the counselling desk." 
                    />
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {schedules
                        .filter(s => s.isAvailable)
                        .slice(0, 3)
                        .map((slot) => (
                          <div key={slot._id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 -mx-2">
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 text-sm">
                                  {new Date(slot.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => startBooking(slot)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Book Slot
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Upcoming Appt Reminder</h3>
                  {appointments.filter(a => a.status === "pending" || a.status === "confirmed").length === 0 ? (
                    <p className="text-xs text-slate-500">You have no upcoming counselling sessions scheduled.</p>
                  ) : (
                    (() => {
                      const next = appointments.filter(a => a.status === "pending" || a.status === "confirmed")[0];
                      return (
                        <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-slate-500 block">Session Date:</span>
                            <span className="text-xs font-bold text-slate-700">
                              {new Date(next.appointmentDate).toLocaleDateString()} at {next.startTime}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            next.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {next.status}
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CalendarCheck className="w-5.5 h-5.5 text-emerald-500" />
              Session Appointment History
            </h2>

            {appointments.length === 0 ? (
              <EmptyState 
                message="No appointment history found" 
                subtitle="Book slots under the Schedule tab to start your wellness sessions." 
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
                    {appointments.map((appt) => {
                      const statusColors = {
                        pending: "bg-amber-50 text-amber-700 border-amber-200",
                        confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        rejected: "bg-rose-50 text-rose-700 border-rose-200",
                        completed: "bg-purple-50 text-purple-700 border-purple-200",
                        cancelled: "bg-slate-100 text-slate-600 border-slate-200",
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
                            {appt.counsellorId?.name || "Wellness Counsellor"}
                          </td>
                          <td className="py-4 max-w-xs truncate text-slate-600 font-medium" title={appt.reason}>
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
                            {(appt.status === "pending" || appt.status === "confirmed") && (
                              <button
                                onClick={() => handleCancelAppointment(appt._id)}
                                className="text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            )}
                            {appt.status === "completed" && (
                              <span className="text-xs font-semibold text-slate-400">Logged</span>
                            )}
                            {appt.status === "cancelled" && (
                              <span className="text-xs font-semibold text-slate-400">Cancelled</span>
                            )}
                            {appt.status === "rejected" && (
                              <span className="text-xs font-semibold text-slate-400">Rejected</span>
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

    </DashboardLayout>
  );
};

export default StudentDashboard;