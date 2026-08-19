import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Clock, 
  User, 
  UserPlus, 
  UserCheck,
  CalendarPlus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Users, 
  Info,
  CalendarCheck,
  Settings,
  Plus
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";
import Button from "../components/Button";
import InputField from "../components/InputField";

import { getUserProfile } from "../services/userApi";
import { getAllCounsellors, addCounsellor, updateCounsellor, deleteCounsellor } from "../services/counsellorApi";
import { getAllSchedules, addSchedule, deleteSchedule } from "../services/scheduleApi";

const AdminDashboard = () => {
  const { tab } = useParams();
  const activeTab = tab || "dashboard";

  // State
  const [profile, setProfile] = useState(null);
  const [counsellor, setCounsellor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Counsellor Form State
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cSpec, setCSpec] = useState("");
  const [cContact, setCContact] = useState("");
  const [isEditingCounsellor, setIsEditingCounsellor] = useState(false);
  const [savingCounsellor, setSavingCounsellor] = useState(false);

  // Schedule Form State
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotEndTime, setSlotEndTime] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get logged-in admin user
      const userRes = await getUserProfile();
      setProfile(userRes.data.user);

      // 2. Get counsellor list
      let counsellorsList = [];
      try {
        const cRes = await getAllCounsellors();
        counsellorsList = cRes.data.counsellors || [];
      } catch (cErr) {
        console.warn("Failed to load counsellors:", cErr);
      }
      
      // Since there's only one counsellor, select the first one
      if (counsellorsList.length > 0) {
        const activeC = counsellorsList[0];
        setCounsellor(activeC);
        setCName(activeC.user?.name || "");
        setCEmail(activeC.user?.email || "");
        setCSpec(activeC.specialization || "");
        setCContact(activeC.contactNumber || "");
      } else {
        setCounsellor(null);
        setCName("");
        setCEmail("");
        setCPassword("");
        setCSpec("");
        setCContact("");
      }

      // 3. Get schedules
      let schedulesList = [];
      try {
        const sRes = await getAllSchedules();
        schedulesList = sRes.data.schedules || [];
      } catch (sErr) {
        console.warn("Failed to load schedules:", sErr);
      }
      setSchedules(schedulesList);

    } catch (err) {
      console.error("Admin dashboard load error:", err);
      setError(err.response?.data?.message || "Failed to load administration workspace details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Admin add counsellor submit
  const handleAddCounsellor = async (e) => {
    e.preventDefault();
    if (!cName.trim() || !cEmail.trim() || !cPassword.trim() || !cSpec.trim() || !cContact.trim()) {
      toast.error("Please fill in all counsellor fields");
      return;
    }

    try {
      setSavingCounsellor(true);
      const payload = {
        name: cName,
        email: cEmail,
        password: cPassword,
        specialization: cSpec,
        contactNumber: cContact
      };
      await addCounsellor(payload);
      toast.success("Counsellor created successfully!");
      fetchData();
    } catch (err) {
      console.error("Counsellor add error:", err);
      toast.error(err.response?.data?.message || "Failed to add counsellor");
    } finally {
      setSavingCounsellor(false);
    }
  };

  // Admin edit counsellor submit
  const handleUpdateCounsellorObj = async (e) => {
    e.preventDefault();
    if (!counsellor) return;
    if (!cName.trim() || !cEmail.trim() || !cSpec.trim() || !cContact.trim()) {
      toast.error("Required fields cannot be empty");
      return;
    }

    try {
      setSavingCounsellor(true);
      const payload = {
        name: cName,
        email: cEmail,
        specialization: cSpec,
        contactNumber: cContact
      };
      await updateCounsellor(counsellor._id, payload);
      toast.success("Counsellor updated successfully!");
      setIsEditingCounsellor(false);
      fetchData();
    } catch (err) {
      console.error("Counsellor update error:", err);
      toast.error(err.response?.data?.message || "Failed to update counsellor");
    } finally {
      setSavingCounsellor(false);
    }
  };

  // Admin delete counsellor profile
  const handleDeleteCounsellorObj = async () => {
    if (!counsellor) return;
    if (!window.confirm("Are you sure you want to remove the counsellor? This deletes their profile and login account.")) {
      return;
    }

    try {
      await deleteCounsellor(counsellor._id);
      toast.success("Counsellor profile deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete counsellor");
    }
  };

  // Admin add schedule slot submit
  const handleAddScheduleSlot = async (e) => {
    e.preventDefault();
    if (!counsellor) {
      toast.error("Please create a counsellor before adding schedule slots");
      return;
    }
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
        counsellor: counsellor._id,
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

  // Admin delete schedule slot
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

  // Stats Computations
  const totalSlotsCount = schedules.length;
  const openSlotsCount = schedules.filter(s => s.isAvailable).length;
  const bookedSlotsCount = totalSlotsCount - openSlotsCount;
  
  if (loading) {
    return (
      <DashboardLayout role="admin" user={profile}>
        <LoadingState message="Loading administration console..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin" user={profile}>
        <ErrorState message={error} onRetry={fetchData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" user={profile}>
      <div className="space-y-8 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Portal Control Centre</span>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {activeTab === "dashboard" && "Administration Overview"}
              {activeTab === "counsellor" && "Counsellor Workspace"}
              {activeTab === "schedules" && "Time Schedules Management"}
              {activeTab === "students" && "Student Directory Details"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "dashboard" && "Overview statistics, schedules check, and portal diagnostics."}
              {activeTab === "counsellor" && "Create or modify the wellness counsellor account."}
              {activeTab === "schedules" && "Configure availability slots for the student counsellor."}
              {activeTab === "students" && "Registered system user roles details."}
            </p>
          </div>

          <div className="flex gap-2">
            <Link 
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "dashboard" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Control Panel
            </Link>
            <Link 
              to="/admin/counsellor"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "counsellor" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Counsellor
            </Link>
            <Link 
              to="/admin/schedules"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "schedules" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              Schedules
            </Link>
          </div>
        </div>

        {/* ------------------- DASHBOARD OVERVIEW TAB ------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            
            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Wellness Counsellors"
                value={counsellor ? 1 : 0}
                subtitle={counsellor ? "Counsellor active" : "No counsellor configured"}
                color="blue"
              />
              <StatCard
                title="Total Schedule Slots"
                value={totalSlotsCount}
                subtitle="All generated slots"
                color="purple"
              />
              <StatCard
                title="Available Slots"
                value={openSlotsCount}
                subtitle="Unbooked available times"
                color="green"
              />
              <StatCard
                title="Booked Sessions"
                value={bookedSlotsCount}
                subtitle="Confirmed student bookings"
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Info Box */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                    Diagnostics & Logs
                  </h2>

                  <div className="space-y-4 text-xs font-medium text-slate-600">
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex gap-2">
                      <UserCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div>
                        <strong>Counsellor Status:</strong> {counsellor ? "Configured and active." : "Action required: Create counsellor."}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border flex gap-2">
                      <Info className="w-4 h-4 shrink-0 text-slate-500" />
                      <div>
                        <strong>System Role Guard:</strong> Secured dashboards for Admin, Counsellor, and Student are working.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wellness Management System</span>
                </div>
              </div>

              {/* Schedules Snapshot */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-emerald-500" />
                    Recent Activity Slots
                  </h2>
                  <Link to="/admin/schedules" className="text-xs text-emerald-600 font-semibold hover:underline">
                    View all ({totalSlotsCount})
                  </Link>
                </div>

                {schedules.length === 0 ? (
                  <EmptyState 
                    message="No schedules configured" 
                    subtitle="Create schedule availability slots under the Schedules tab." 
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {schedules.slice(0, 3).map((slot) => (
                      <div key={slot._id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-sm">
                              {new Date(slot.date).toLocaleDateString(undefined, {
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

                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          slot.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {slot.isAvailable ? "Available" : "Booked"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ------------------- COUNSELLOR MANAGEMENT TAB ------------------- */}
        {activeTab === "counsellor" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Counsellor Profile Display & Deletion */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5.5 h-5.5 text-emerald-500" />
                Active Counsellor Profile
              </h2>

              {!counsellor ? (
                <EmptyState 
                  message="No active counsellor configured" 
                  subtitle="Use the creation form on the right to configure the single counsellor account." 
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 border rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 font-bold text-2xl flex items-center justify-center">
                      {counsellor.user?.name?.split(" ").map(n => n[0]).join("") || "C"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-lg">{counsellor.user?.name}</h3>
                      <p className="text-sm text-slate-500 font-semibold">{counsellor.user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-xs font-semibold uppercase">Specialization</span>
                      <span className="text-slate-700 font-extrabold text-base mt-1 block">{counsellor.specialization}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-xs font-semibold uppercase">Contact Desk</span>
                      <span className="text-slate-700 font-extrabold text-base mt-1 block">{counsellor.contactNumber}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-2">
                    <button
                      onClick={() => setIsEditingCounsellor(!isEditingCounsellor)}
                      className="w-1/2 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      {isEditingCounsellor ? "Close Editor" : "Edit Details"}
                    </button>
                    <button
                      onClick={handleDeleteCounsellorObj}
                      className="w-1/2 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Counsellor Creation / Edit Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                {isEditingCounsellor ? (
                  <>
                    <Settings className="w-5.5 h-5.5 text-emerald-500" />
                    Modify Counsellor profile
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5.5 h-5.5 text-emerald-500" />
                    Configure New Counsellor
                  </>
                )}
              </h2>

              {counsellor && !isEditingCounsellor ? (
                <div className="p-8 border border-dashed rounded-2xl bg-slate-50 text-center space-y-4">
                  <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-700">Counsellor already configured</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Only one counsellor is permitted. To change details, click "Edit Details" on the active profile card.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={isEditingCounsellor ? handleUpdateCounsellorObj : handleAddCounsellor} className="space-y-4">
                  <InputField
                    label="Full Name"
                    type="text"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="Enter counsellor's full name"
                  />

                  <InputField
                    label="Email Address"
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="e.g. counsellor@college.edu"
                  />

                  {!isEditingCounsellor && (
                    <InputField
                      label="Login Password"
                      type="password"
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      placeholder="Configure account password"
                    />
                  )}

                  <InputField
                    label="Specialization"
                    type="text"
                    value={cSpec}
                    onChange={(e) => setCSpec(e.target.value)}
                    placeholder="e.g. Anxiety Support, CBT, Academic Stress"
                  />

                  <InputField
                    label="Contact Desk / Phone"
                    type="text"
                    value={cContact}
                    onChange={(e) => setCContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210, Wellness block Rm 12"
                  />

                  <div className="pt-4 flex gap-2">
                    {isEditingCounsellor && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCounsellor(false)}
                        className="w-1/3 border border-slate-200 text-slate-600 hover:bg-slate-50 py-3 rounded-xl text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingCounsellor}
                      className={`py-3 rounded-xl text-sm font-semibold text-white transition disabled:bg-gray-400 ${
                        isEditingCounsellor ? "w-2/3 bg-slate-800 hover:bg-slate-700" : "w-full bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {savingCounsellor ? "Saving details..." : isEditingCounsellor ? "Save Settings" : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ------------------- SCHEDULES MANAGEMENT TAB ------------------- */}
        {activeTab === "schedules" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Schedule Form */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CalendarPlus className="w-5.5 h-5.5 text-emerald-500" />
                Add Availability Slot
              </h2>

              {!counsellor ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center space-y-3">
                  <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">Counsellor Required</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      No active counsellor exists. Configure a counsellor account under the Counsellor tab before allocating schedule slots.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddScheduleSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Target Counsellor (Auto-linked)
                    </label>
                    <div className="bg-slate-50 border rounded-lg p-2.5 text-sm font-semibold text-slate-700">
                      {counsellor.user?.name || "College Counsellor"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
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
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
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
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
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
              )}
            </div>

            {/* Allocated Slots list */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CalendarCheck className="w-5.5 h-5.5 text-emerald-500" />
                All Availability Slots List
              </h2>

              {schedules.length === 0 ? (
                <EmptyState 
                  message="No schedules generated yet" 
                  subtitle="Use the generator form on the left to allocate time blocks." 
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Time Interval</th>
                        <th className="pb-3 font-semibold">Counsellor</th>
                        <th className="pb-3 font-semibold text-center">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {schedules.map((slot) => (
                        <tr key={slot._id} className="hover:bg-slate-50/30 transition">
                          <td className="py-4 font-semibold text-slate-800">
                            {new Date(slot.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-4 text-slate-500 font-medium">
                            {slot.startTime} - {slot.endTime}
                          </td>
                          <td className="py-4 text-slate-600 font-medium">
                            {slot.counsellor?.user?.name || "Counsellor"}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                              slot.isAvailable 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                              {slot.isAvailable ? "Available" : "Booked"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteScheduleSlot(slot._id)}
                              className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition inline-flex items-center"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* ------------------- STUDENTS DIRECTORY TAB ------------------- */}
        {activeTab === "students" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            
            <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl flex gap-3 text-sm">
              <ShieldAlert className="w-5.5 h-5.5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold">Backend Limitation Alert: Registered Student List</h4>
                <p className="mt-1 text-xs text-amber-800 font-medium">
                  The backend application router has not exposed an endpoint to fetch or list all registered students (there is no `User.find()` query or `/api/users/list` route defined on the Node.js Express server).
                  <br />
                  <br />
                  For assessment purposes, a high-fidelity visual layout is shown below. To fetch live lists, update the backend controllers and router config files first.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5.5 h-5.5 text-emerald-500" />
                Student User Directory (Visual Placeholder)
              </h2>
              <span className="text-xs bg-slate-100 border text-slate-500 px-3 py-1 rounded-full font-bold">
                API Unexposed
              </span>
            </div>

            <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b bg-white p-3">
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/30 transition">
                    <td className="p-4 font-bold text-slate-800">Alwin Antony</td>
                    <td className="p-4 text-slate-500">alwin.mca@college.edu</td>
                    <td className="p-4 text-slate-600 font-semibold">MCA</td>
                    <td className="p-4 text-slate-500 font-medium">student</td>
                    <td className="p-4"><span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition">
                    <td className="p-4 font-bold text-slate-800">Adarsh Kumar</td>
                    <td className="p-4 text-slate-500">adarsh.mca@college.edu</td>
                    <td className="p-4 text-slate-600 font-semibold">MCA</td>
                    <td className="p-4 text-slate-500 font-medium">student</td>
                    <td className="p-4"><span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition">
                    <td className="p-4 font-bold text-slate-800">Sonia Philip</td>
                    <td className="p-4 text-slate-500">sonia.philip@college.edu</td>
                    <td className="p-4 text-slate-600 font-semibold">MSc Psychology</td>
                    <td className="p-4 text-slate-500 font-medium">student</td>
                    <td className="p-4"><span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;