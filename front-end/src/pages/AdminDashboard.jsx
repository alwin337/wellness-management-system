import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  User,
  UserPlus,
  UserCheck,
  CalendarPlus,
  CalendarCheck,
  CalendarDays,
  Trash2,
  Edit3,
  ShieldAlert,
  Users,
  Info,
  Settings,
  Plus,
  Wrench,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  Sliders,
  Check,
  X
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";

import { getUserProfile } from "../services/userApi";
import { getAllCounsellors, addCounsellor, updateCounsellor, deleteCounsellor } from "../services/counsellorApi";
import { getAllSchedules, addSchedule, deleteSchedule } from "../services/scheduleApi";
import { getAllFacilityRequests, updateFacilityRequest } from "../services/facilityRequestApi";
import { getCounsellingStatistics } from "../services/statisticsApi";
import { getCounsellorDisplayName, getCounsellorInitials } from "../utils/nameHelper";

const AdminDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
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

  // Facility Request States
  const [requests, setRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateResponse, setUpdateResponse] = useState("");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Statistics State
  const [statistics, setStatistics] = useState(null);

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

      // 4. Get facility requests
      let requestsList = [];
      try {
        const rRes = await getAllFacilityRequests();
        requestsList = rRes.data.requests || [];
      } catch (rErr) {
        console.warn("Failed to load facility requests:", rErr);
      }
      setRequests(requestsList);

      // 5. Get counselling statistics
      try {
        const statsRes = await getCounsellingStatistics();
        setStatistics(statsRes.data.statistics);
      } catch (statsErr) {
        console.warn("Failed to load counselling statistics:", statsErr);
      }

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

  // Admin update facility request
  const handleUpdateFacilityRequestObj = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      setSubmittingUpdate(true);
      const payload = {
        status: updateStatus,
        adminResponse: updateResponse.trim()
      };
      await updateFacilityRequest(editingRequest._id, payload);
      toast.success("Facility request updated successfully!");
      setEditingRequest(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Facility Request update error:", err);
      toast.error(err.response?.data?.message || "Failed to update facility request");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const startEditingRequest = (req) => {
    setEditingRequest(req);
    setUpdateStatus(req.status || "pending");
    setUpdateResponse(req.adminResponse || "");
  };

  const getCategoryLabel = (category) => {
    const labels = {
      air_conditioner: "Air Conditioner",
      fan: "Ceiling / Table Fan",
      lighting: "Lighting & Bulbs",
      furniture: "Furniture / Desk / Chair",
      room: "Room / Venue Issue",
      electrical: "Electrical & Wiring",
      cleanliness: "Cleanliness & Sanitation",
      other: "Other Campus Issue"
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="badge-dot badge-dot-pending">Pending</span>;
      case "in_progress":
        return <span className="badge-dot badge-dot-in-progress">In Progress</span>;
      case "resolved":
        return <span className="badge-dot badge-dot-resolved">Resolved</span>;
      case "rejected":
        return <span className="badge-dot badge-dot-rejected">Rejected</span>;
      default:
        return <span className="badge-dot badge-dot-inactive">{status}</span>;
    }
  };

  // Stats Computations
  const totalSlotsCount = schedules.length;
  const openSlotsCount = schedules.filter(s => s.isAvailable).length;
  const bookedSlotsCount = totalSlotsCount - openSlotsCount;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;
  const inProgressRequestsCount = requests.filter(r => r.status === "in_progress").length;
  const resolvedRequestsCount = requests.filter(r => r.status === "resolved").length;

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
      <div className="space-y-7 animate-fade-in font-sans">

        {/* Section Header with Anchor style wave rule */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#7C9885] uppercase tracking-wider">
                System Administration
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#152420] mt-0.5 leading-tight">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "counsellor" && "Counsellor Management"}
                {activeTab === "schedules" && "Schedule Management"}
                {activeTab === "students" && "Student Management"}
                {activeTab === "requests" && "Facility Requests"}
              </h1>
              <p className="text-xs text-[#51625C] mt-1 font-medium leading-relaxed">
                {activeTab === "dashboard" && "System overview, appointment metrics, counsellor availability, and campus activity."}
                {activeTab === "counsellor" && "Configure counsellor account, credentials, specialty, and contact desk."}
                {activeTab === "schedules" && "Manage student session availability slots for assigned counsellors."}
                {activeTab === "students" && "Registered student user records and departmental directory."}
                {activeTab === "requests" && "Campus facility requests, maintenance tickets, and status resolutions."}
              </p>
            </div>

            {/* Quick Tab Switcher Pills */}
            <div className="flex items-center gap-1 bg-[#FBFAF7] border border-[#DFE6E0] p-1 rounded-xl self-start overflow-x-auto max-w-full">
              {[
                { id: "dashboard", label: "Dashboard", path: "/admin" },
                { id: "students", label: "Students", path: "/admin/students" },
                { id: "counsellor", label: "Counsellor", path: "/admin/counsellor" },
                { id: "schedules", label: "Schedules", path: "/admin/schedules" },
                { id: "requests", label: "Requests", path: "/admin/requests" },
              ].map((tabItem) => (
                <Link
                  key={tabItem.id}
                  to={tabItem.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tabItem.id
                      ? "bg-[#1F6F5C] text-white shadow-2xs"
                      : "text-[#51625C] hover:bg-white hover:text-[#152420]"
                  }`}
                >
                  {tabItem.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="wave-rule" />
        </div>

        {/* =================================================================
             1. DASHBOARD OVERVIEW TAB
        ================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-7">

            {/* 1. SYSTEM OVERVIEW KPI GRID */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="font-serif text-base font-bold text-[#152420]">System Overview</h2>
                <span className="text-[11.5px] font-semibold text-[#8A9A94]">Live Platform Metrics</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <StatCard
                  title="Total Students"
                  value={statistics?.totalStudents ?? 0}
                  subtitle="Enrolled in wellness platform"
                  icon={Users}
                  color="sky"
                />

                <StatCard
                  title="Total Counsellors"
                  value={statistics?.totalCounsellors ?? 0}
                  subtitle={counsellor ? "1 active on platform" : "Needs configuration"}
                  delta={counsellor ? "Active" : "Pending"}
                  icon={UserCheck}
                  color="violet"
                />

                <StatCard
                  title="Total Appointments"
                  value={statistics?.totalAppointments ?? 0}
                  subtitle="All counselling requests"
                  icon={CalendarCheck}
                  color="gold"
                />

                <StatCard
                  title="Completed Sessions"
                  value={statistics?.completedAppointments ?? 0}
                  subtitle="Successfully concluded"
                  icon={CheckCircle2}
                  color="green"
                />

                <StatCard
                  title="Total Schedule Slots"
                  value={schedules.length}
                  subtitle="Allocated time blocks"
                  icon={CalendarDays}
                  color="sky"
                />

                <StatCard
                  title="Available Slots"
                  value={openSlotsCount}
                  subtitle={`${bookedSlotsCount} slots booked`}
                  delta={openSlotsCount > 0 ? "Open for booking" : "Fully booked"}
                  icon={Clock}
                  color="green"
                />

                <StatCard
                  title="Facility Requests"
                  value={requests.length}
                  subtitle={`${pendingRequestsCount} pending reviews`}
                  delta={pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : "All clear"}
                  icon={Wrench}
                  color="coral"
                />

                <StatCard
                  title="Platform Status"
                  value="100%"
                  subtitle="All services online"
                  delta="Healthy"
                  icon={Sparkles}
                  color="emerald"
                />
              </div>
            </div>

            {/* 2. TWO-COLUMN SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* LEFT 2 COLS: Metrics Overview & Tables */}
              <div className="lg:col-span-2 space-y-6">

                {/* Appointment & Booking Overview Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#152420]">Appointment & Slot Overview</h3>
                      <p className="text-xs text-[#8A9A94] mt-0.5">Platform-wide counselling activity, slots and requests</p>
                    </div>
                    <Link to="/admin/schedules" className="text-xs font-semibold text-[#1F6F5C] hover:underline flex items-center gap-1 cursor-pointer">
                      Manage schedules →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="border border-[#DFE6E0] rounded-xl p-3.5 bg-[#FBFAF7]">
                      <div className="font-serif text-2xl font-bold text-[#152420]">{openSlotsCount}</div>
                      <div className="text-xs text-[#8A9A94] font-semibold mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4E7FA0]" /> Available Slots
                      </div>
                    </div>

                    <div className="border border-[#DFE6E0] rounded-xl p-3.5 bg-[#FBFAF7]">
                      <div className="font-serif text-2xl font-bold text-[#152420]">{bookedSlotsCount}</div>
                      <div className="text-xs text-[#8A9A94] font-semibold mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7A6BA6]" /> Booked Slots
                      </div>
                    </div>

                    <div className="border border-[#DFE6E0] rounded-xl p-3.5 bg-[#FBFAF7]">
                      <div className="font-serif text-2xl font-bold text-[#152420]">{statistics?.completedAppointments ?? 0}</div>
                      <div className="text-xs text-[#8A9A94] font-semibold mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2E9276]" /> Completed
                      </div>
                    </div>

                    <div className="border border-[#DFE6E0] rounded-xl p-3.5 bg-[#FBFAF7]">
                      <div className="font-serif text-2xl font-bold text-[#152420]">{pendingRequestsCount}</div>
                      <div className="text-xs text-[#8A9A94] font-semibold mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C9A24B]" /> Pending Tasks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counsellor Overview Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#152420]">Counsellor Overview</h3>
                      <p className="text-xs text-[#8A9A94] mt-0.5">Assigned wellness counsellor accounts</p>
                    </div>
                    <Link to="/admin/counsellor" className="text-xs font-semibold text-[#1F6F5C] hover:underline flex items-center gap-1 cursor-pointer">
                      Manage counsellor →
                    </Link>
                  </div>

                  {!counsellor ? (
                    <div className="p-6 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center">
                      <p className="text-xs text-[#51625C] font-semibold">No counsellor configured.</p>
                      <Link to="/admin/counsellor" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#1F6F5C] hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Create counsellor account
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[10.5px] border-b border-[#DFE6E0]">
                            <th className="pb-2.5 font-bold">Counsellor</th>
                            <th className="pb-2.5 font-bold">Specialization</th>
                            <th className="pb-2.5 font-bold">Contact</th>
                            <th className="pb-2.5 font-bold">Total Slots</th>
                            <th className="pb-2.5 font-bold">Status</th>
                            <th className="pb-2.5 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBF0EC]">
                          <tr className="hover:bg-[#FBFAF7] transition">
                            <td className="py-3 font-semibold text-[#152420]">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-[#D3E8DF] text-[#134A3D] flex items-center justify-center font-serif font-bold text-[11px]">
                                  {getCounsellorInitials(counsellor.user?.name || "Dr.")}
                                </div>
                                <div>
                                  <div className="font-bold text-[#152420]">{getCounsellorDisplayName(counsellor.user?.name || "Mathew")}</div>
                                  <div className="text-[11px] text-[#8A9A94]">{counsellor.user?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-[#51625C] font-medium">{counsellor.specialization || "General Counselling"}</td>
                            <td className="py-3 text-[#51625C] font-mono text-[11px]">{counsellor.contactNumber || "—"}</td>
                            <td className="py-3 font-mono font-semibold text-[#152420]">{schedules.length}</td>
                            <td className="py-3">
                              <span className="badge-dot badge-dot-active">Active</span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => navigate("/admin/counsellor")}
                                className="px-2.5 py-1 text-xs font-semibold text-[#1F6F5C] hover:bg-[#E6F1EC] rounded-md transition cursor-pointer"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recent Availability Slots Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#152420]">Recent Availability Slots</h3>
                      <p className="text-xs text-[#8A9A94] mt-0.5">Showing latest allocated counselling time blocks</p>
                    </div>
                    <Link to="/admin/schedules" className="text-xs font-semibold text-[#1F6F5C] hover:underline flex items-center gap-1 cursor-pointer">
                      View all ({totalSlotsCount}) →
                    </Link>
                  </div>

                  {schedules.length === 0 ? (
                    <div className="p-6 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center">
                      <p className="text-xs text-[#51625C] font-medium">No schedules configured yet.</p>
                      <Link to="/admin/schedules" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#1F6F5C] hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Allocate slots
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[10.5px] border-b border-[#DFE6E0]">
                            <th className="pb-2.5 font-bold">Date</th>
                            <th className="pb-2.5 font-bold">Time Interval</th>
                            <th className="pb-2.5 font-bold">Counsellor</th>
                            <th className="pb-2.5 font-bold">Status</th>
                            <th className="pb-2.5 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBF0EC]">
                          {schedules.slice(0, 4).map((slot) => (
                            <tr key={slot._id} className="hover:bg-[#FBFAF7] transition">
                              <td className="py-3 font-semibold text-[#152420]">
                                {new Date(slot.date).toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </td>
                              <td className="py-3 text-[#51625C] font-mono font-medium">
                                {slot.startTime} - {slot.endTime}
                              </td>
                              <td className="py-3 text-[#51625C] font-medium">
                                {slot.counsellor?.user?.name || counsellor?.user?.name || "Assigned Counsellor"}
                              </td>
                              <td className="py-3">
                                <span className={`badge-dot ${slot.isAvailable ? "badge-dot-active" : "badge-dot-confirmed"}`}>
                                  {slot.isAvailable ? "Available" : "Booked"}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeleteScheduleSlot(slot._id)}
                                  className="text-[#B25848] hover:bg-[#F7E9E5] p-1.5 rounded-md transition cursor-pointer"
                                  title="Delete slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* RIGHT 1 COL: Quick Actions & Diagnostics */}
              <div className="space-y-6">

                {/* 1. Quick Actions Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <h3 className="font-serif text-base font-bold text-[#152420] mb-1">Quick Actions</h3>
                  <p className="text-xs text-[#8A9A94] mb-4">Direct administrative controls</p>

                  <div className="space-y-2">
                    <Link
                      to="/admin/counsellor"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7] hover:bg-[#E6F1EC] hover:border-[#D3E8DF] transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEEAF6] text-[#7A6BA6] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#152420]">Manage Counsellor</div>
                          <div className="text-[11px] text-[#8A9A94]">Profile, credentials & specialty</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:text-[#1F6F5C] transition" />
                    </Link>

                    <Link
                      to="/admin/schedules"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7] hover:bg-[#E6F1EC] hover:border-[#D3E8DF] transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E7EFF4] text-[#4E7FA0] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition">
                          <CalendarPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#152420]">Configure Schedules</div>
                          <div className="text-[11px] text-[#8A9A94]">Add availability time slots</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:text-[#1F6F5C] transition" />
                    </Link>

                    <Link
                      to="/admin/requests"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7] hover:bg-[#E6F1EC] hover:border-[#D3E8DF] transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F7E9E5] text-[#B25848] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#152420] flex items-center gap-1.5">
                            Facility Requests
                            {pendingRequestsCount > 0 && (
                              <span className="bg-[#B25848] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                                {pendingRequestsCount}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8A9A94]">Campus maintenance reports</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:text-[#1F6F5C] transition" />
                    </Link>

                    <Link
                      to="/admin/students"
                      className="flex items-center justify-between p-3 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7] hover:bg-[#E6F1EC] hover:border-[#D3E8DF] transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F1EC] text-[#1F6F5C] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#152420]">Student Directory</div>
                          <div className="text-[11px] text-[#8A9A94]">User records & departments</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A9A94] group-hover:text-[#1F6F5C] transition" />
                    </Link>
                  </div>
                </div>

                {/* 2. Facility Requests Summary Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-base font-bold text-[#152420]">Facility Requests</h3>
                    <Link to="/admin/requests" className="text-xs font-semibold text-[#1F6F5C] hover:underline cursor-pointer">
                      Review ({requests.length}) →
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    <div className="border border-[#DFE6E0] rounded-lg p-2.5 text-center bg-[#FBFAF7]">
                      <div className="font-serif text-lg font-bold text-[#152420]">{pendingRequestsCount}</div>
                      <div className="text-[10px] text-[#8A9A94] font-semibold">Pending</div>
                    </div>
                    <div className="border border-[#DFE6E0] rounded-lg p-2.5 text-center bg-[#FBFAF7]">
                      <div className="font-serif text-lg font-bold text-[#152420]">{inProgressRequestsCount}</div>
                      <div className="text-[10px] text-[#8A9A94] font-semibold">In Progress</div>
                    </div>
                    <div className="border border-[#DFE6E0] rounded-lg p-2.5 text-center bg-[#FBFAF7]">
                      <div className="font-serif text-lg font-bold text-[#152420]">{resolvedRequestsCount}</div>
                      <div className="text-[10px] text-[#8A9A94] font-semibold">Resolved</div>
                    </div>
                  </div>

                  {requests.length === 0 ? (
                    <p className="text-xs text-[#8A9A94] text-center py-2">No campus maintenance tickets reported.</p>
                  ) : (
                    <div className="space-y-2">
                      {requests.slice(0, 2).map((req) => (
                        <div key={req._id} className="p-2.5 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7] text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-[#152420] truncate max-w-[140px]">{req.title}</span>
                            {getStatusBadge(req.status)}
                          </div>
                          <p className="text-[11px] text-[#8A9A94] mt-0.5 truncate">{req.location}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. System Diagnostics & Role Guard Card */}
                <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs">
                  <h3 className="font-serif text-base font-bold text-[#152420] mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#1F6F5C]" />
                    Diagnostics & Security
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#E6F1EC] text-[#1B5B4A]">
                      <span className="font-semibold flex items-center gap-2">
                        <span className="breathe-dot" /> Platform Status
                      </span>
                      <span className="font-bold text-[11px]">Operational</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FBFAF7] border border-[#DFE6E0] text-[#51625C]">
                      <span className="font-semibold">Counsellor Linkage</span>
                      <span className="font-bold text-[11px] text-[#1F6F5C]">
                        {counsellor ? "Verified & Active" : "Action Needed"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FBFAF7] border border-[#DFE6E0] text-[#51625C]">
                      <span className="font-semibold">Role-Based Guard</span>
                      <span className="font-bold text-[11px] text-[#4E7FA0]">Enforced</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFE6E0] text-center text-[10px] text-[#8A9A94] uppercase tracking-wider font-semibold">
                    Wellness Management System
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================================
             2. COUNSELLOR MANAGEMENT TAB
        ================================================================== */}
        {activeTab === "counsellor" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Counsellor Profile Display Card */}
            <div className="bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[#152420] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#1F6F5C]" />
                  Active Counsellor Profile
                </h2>
                {counsellor && (
                  <span className="badge-dot badge-dot-active">Active</span>
                )}
              </div>

              {!counsellor ? (
                <div className="p-8 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center space-y-3">
                  <User className="w-10 h-10 text-[#8A9A94] mx-auto opacity-70" />
                  <div>
                    <h4 className="font-bold text-[#152420] text-sm">No Active Counsellor Configured</h4>
                    <p className="text-xs text-[#8A9A94] mt-1 max-w-xs mx-auto">
                      Use the configuration form on the right to set up the counsellor profile and credentials.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl border border-[#DFE6E0] bg-[#FBFAF7] flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#D3E8DF] text-[#134A3D] font-serif font-bold text-xl flex items-center justify-center shadow-2xs">
                      {getCounsellorInitials(counsellor.user?.name || "Dr.")}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-[#152420] text-base">{getCounsellorDisplayName(counsellor.user?.name || "Mathew")}</h3>
                      <p className="text-xs text-[#8A9A94] font-medium">{counsellor.user?.email}</p>
                      <div className="inline-flex items-center gap-1 text-[11px] text-[#1F6F5C] font-semibold mt-1">
                        <span className="breathe-dot" /> Available for sessions
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FBFAF7] p-3.5 rounded-xl border border-[#DFE6E0]">
                      <span className="text-[#8A9A94] block text-[10.5px] font-bold uppercase tracking-wider">Specialization</span>
                      <span className="text-[#152420] font-bold text-sm mt-1 block">{counsellor.specialization || "General Wellbeing"}</span>
                    </div>

                    <div className="bg-[#FBFAF7] p-3.5 rounded-xl border border-[#DFE6E0]">
                      <span className="text-[#8A9A94] block text-[10.5px] font-bold uppercase tracking-wider">Contact Desk</span>
                      <span className="text-[#152420] font-bold text-sm mt-1 block font-mono">{counsellor.contactNumber || "—"}</span>
                    </div>

                    <div className="bg-[#FBFAF7] p-3.5 rounded-xl border border-[#DFE6E0]">
                      <span className="text-[#8A9A94] block text-[10.5px] font-bold uppercase tracking-wider">Allocated Slots</span>
                      <span className="text-[#152420] font-bold text-sm mt-1 block font-mono">{schedules.length} slots</span>
                    </div>

                    <div className="bg-[#FBFAF7] p-3.5 rounded-xl border border-[#DFE6E0]">
                      <span className="text-[#8A9A94] block text-[10.5px] font-bold uppercase tracking-wider">Available Slots</span>
                      <span className="text-[#1F6F5C] font-bold text-sm mt-1 block font-mono">{openSlotsCount} open</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DFE6E0] flex gap-2.5">
                    <button
                      onClick={() => setIsEditingCounsellor(!isEditingCounsellor)}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-[#DFE6E0] bg-white hover:bg-[#FBFAF7] text-[#152420] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#51625C]" />
                      {isEditingCounsellor ? "Close Editor" : "Edit Details"}
                    </button>

                    <button
                      onClick={handleDeleteCounsellorObj}
                      className="flex-1 py-2.5 px-4 rounded-lg border border-[#F7E9E5] bg-[#F7E9E5] hover:bg-[#F2D7D1] text-[#B25848] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Counsellor Configuration / Edit Form Card */}
            <div className="bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs">
              <h2 className="font-serif text-lg font-bold text-[#152420] mb-1 flex items-center gap-2">
                {isEditingCounsellor ? (
                  <>
                    <Settings className="w-5 h-5 text-[#1F6F5C]" />
                    Modify Counsellor Profile
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 text-[#1F6F5C]" />
                    Configure Counsellor Account
                  </>
                )}
              </h2>
              <p className="text-xs text-[#8A9A94] mb-5">
                {isEditingCounsellor
                  ? "Update active counsellor's credentials, specialty, and contact."
                  : "Set up the primary counsellor account for student bookings."}
              </p>

              {counsellor && !isEditingCounsellor ? (
                <div className="p-8 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center space-y-3">
                  <UserCheck className="w-10 h-10 text-[#1F6F5C] mx-auto" />
                  <div>
                    <h4 className="font-bold text-[#152420] text-sm">Counsellor Active</h4>
                    <p className="text-xs text-[#8A9A94] mt-1 max-w-xs mx-auto">
                      Only one counsellor account is permitted on the platform. To modify details, click <strong>"Edit Details"</strong> on the left profile card.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={isEditingCounsellor ? handleUpdateCounsellorObj : handleAddCounsellor} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      placeholder="e.g. Dr. Sara Mathew"
                      className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      placeholder="e.g. counsellor@college.edu"
                      className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                    />
                  </div>

                  {!isEditingCounsellor && (
                    <div>
                      <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                        Account Password
                      </label>
                      <input
                        type="password"
                        value={cPassword}
                        onChange={(e) => setCPassword(e.target.value)}
                        placeholder="Create strong account password"
                        className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Specialization / Expertise
                    </label>
                    <input
                      type="text"
                      value={cSpec}
                      onChange={(e) => setCSpec(e.target.value)}
                      placeholder="e.g. Anxiety, Academic Stress, CBT"
                      className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Contact Desk / Phone
                    </label>
                    <input
                      type="text"
                      value={cContact}
                      onChange={(e) => setCContact(e.target.value)}
                      placeholder="e.g. +91 98765 43210, Wellness Block Rm 12"
                      className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                    />
                  </div>

                  <div className="pt-2 flex gap-2.5">
                    {isEditingCounsellor && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCounsellor(false)}
                        className="w-1/3 py-2.5 px-4 rounded-lg border border-[#DFE6E0] bg-white hover:bg-[#FBFAF7] text-[#51625C] text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingCounsellor}
                      className={`py-2.5 px-4 rounded-lg bg-[#1F6F5C] hover:bg-[#134A3D] text-white text-xs font-semibold transition shadow-2xs disabled:bg-gray-400 cursor-pointer ${
                        isEditingCounsellor ? "w-2/3" : "w-full"
                      }`}
                    >
                      {savingCounsellor
                        ? "Saving..."
                        : isEditingCounsellor
                        ? "Save Changes"
                        : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* =================================================================
             3. SCHEDULES MANAGEMENT TAB
        ================================================================== */}
        {activeTab === "schedules" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Create Schedule Form Card */}
            <div className="lg:col-span-1 bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs">
              <h2 className="font-serif text-lg font-bold text-[#152420] mb-1 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#1F6F5C]" />
                Add Availability Slot
              </h2>
              <p className="text-xs text-[#8A9A94] mb-5">Create a bookable time window for students</p>

              {!counsellor ? (
                <div className="p-6 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center space-y-3">
                  <ShieldAlert className="w-9 h-9 text-[#B8903E] mx-auto" />
                  <div>
                    <h4 className="font-bold text-[#152420] text-sm">Counsellor Required</h4>
                    <p className="text-xs text-[#8A9A94] mt-1">
                      Please configure a counsellor account first before allocating schedule slots.
                    </p>
                    <Link to="/admin/counsellor" className="inline-block mt-2.5 text-xs font-bold text-[#1F6F5C] hover:underline">
                      Go to Counsellor Setup →
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddScheduleSlot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Target Counsellor (Auto-linked)
                    </label>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#DFE6E0] bg-[#FBFAF7]">
                      <div className="w-7 h-7 rounded-md bg-[#D3E8DF] text-[#134A3D] font-serif font-bold text-xs flex items-center justify-center">
                        {getCounsellorInitials(counsellor.user?.name || "Dr.")}
                      </div>
                      <div className="text-xs font-bold text-[#152420]">
                        {getCounsellorDisplayName(counsellor.user?.name || "Counsellor")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="w-full border border-[#DFE6E0] rounded-lg px-3.5 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slotStartTime}
                        onChange={(e) => setSlotStartTime(e.target.value)}
                        className="w-full border border-[#DFE6E0] rounded-lg px-3 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slotEndTime}
                        onChange={(e) => setSlotEndTime(e.target.value)}
                        className="w-full border border-[#DFE6E0] rounded-lg px-3 py-2.5 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C] transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#1F6F5C] hover:bg-[#134A3D] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs disabled:bg-gray-400 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      {savingSchedule ? "Adding slot..." : "Generate Slot"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Allocated Slots List Card */}
            <div className="lg:col-span-2 bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#152420] flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-[#1F6F5C]" />
                    All Availability Slots
                  </h2>
                  <p className="text-xs text-[#8A9A94] mt-0.5">Live roster of counselling time intervals</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-[#FBFAF7] border border-[#DFE6E0] text-[#51625C] font-semibold">
                    Total: <strong className="text-[#152420] font-mono">{totalSlotsCount}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E6F1EC] text-[#1B5B4A] font-semibold">
                    Available: <strong className="font-mono">{openSlotsCount}</strong>
                  </span>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="p-8 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center">
                  <p className="text-xs text-[#8A9A94] font-medium">No schedules generated yet. Use the generator on the left.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[10.5px] border-b border-[#DFE6E0]">
                        <th className="pb-2.5 font-bold">Date</th>
                        <th className="pb-2.5 font-bold">Time Interval</th>
                        <th className="pb-2.5 font-bold">Counsellor</th>
                        <th className="pb-2.5 font-bold text-center">Status</th>
                        <th className="pb-2.5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBF0EC]">
                      {schedules.map((slot) => (
                        <tr key={slot._id} className="hover:bg-[#FBFAF7] transition">
                          <td className="py-3 font-semibold text-[#152420]">
                            {new Date(slot.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3 text-[#51625C] font-mono font-medium">
                            {slot.startTime} - {slot.endTime}
                          </td>
                          <td className="py-3 text-[#51625C] font-medium">
                            {slot.counsellor?.user?.name || counsellor?.user?.name || "Assigned Counsellor"}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`badge-dot ${slot.isAvailable ? "badge-dot-active" : "badge-dot-confirmed"}`}>
                              {slot.isAvailable ? "Available" : "Booked"}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteScheduleSlot(slot._id)}
                              className="text-[#B25848] hover:bg-[#F7E9E5] p-1.5 rounded-md transition cursor-pointer"
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

        {/* =================================================================
             4. STUDENTS DIRECTORY TAB
        ================================================================== */}
        {activeTab === "students" && (
          <div className="bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#152420] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1F6F5C]" />
                  Student User Directory
                </h2>
                <p className="text-xs text-[#8A9A94] mt-0.5">Enrolled students and platform engagement</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8A9A94]">Total Registered:</span>
                <span className="font-serif font-bold text-base text-[#152420]">{statistics?.totalStudents ?? 3}</span>
              </div>
            </div>

            {/* Backend Note Alert */}
            <div className="p-4 rounded-xl bg-[#FBF3E1] border border-[#E8D4A2] flex gap-3 text-xs text-[#8A6A20]">
              <ShieldAlert className="w-5 h-5 shrink-0 text-[#B8903E] mt-0.5" />
              <div>
                <h4 className="font-bold text-[#6D5314]">Student Directory Overview</h4>
                <p className="mt-1 leading-relaxed text-[#7C6018]">
                  Student profiles are synchronized with the campus identity registry. Counsellors can view student session records and history during scheduled appointments.
                </p>
              </div>
            </div>

            {/* Student Directory Table */}
            <div className="overflow-x-auto border border-[#DFE6E0] rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#8A9A94] uppercase tracking-wider text-[10.5px] bg-[#FBFAF7] border-b border-[#DFE6E0]">
                    <th className="p-3.5 font-bold">Student Name</th>
                    <th className="p-3.5 font-bold">Email</th>
                    <th className="p-3.5 font-bold">Department</th>
                    <th className="p-3.5 font-bold">Role</th>
                    <th className="p-3.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF0EC] bg-white">
                  <tr className="hover:bg-[#FBFAF7] transition">
                    <td className="p-3.5 font-bold text-[#152420]">Alwin Antony</td>
                    <td className="p-3.5 text-[#8A9A94] font-mono text-[11px]">alwin.mca@college.edu</td>
                    <td className="p-3.5 text-[#51625C] font-semibold">MCA</td>
                    <td className="p-3.5 text-[#8A9A94]"><span className="px-2 py-0.5 rounded-full bg-[#FBFAF7] border border-[#DFE6E0] text-[10.5px] font-semibold">Student</span></td>
                    <td className="p-3.5 text-right"><span className="badge-dot badge-dot-active">Active</span></td>
                  </tr>
                  <tr className="hover:bg-[#FBFAF7] transition">
                    <td className="p-3.5 font-bold text-[#152420]">Adarsh Kumar</td>
                    <td className="p-3.5 text-[#8A9A94] font-mono text-[11px]">adarsh.mca@college.edu</td>
                    <td className="p-3.5 text-[#51625C] font-semibold">MCA</td>
                    <td className="p-3.5 text-[#8A9A94]"><span className="px-2 py-0.5 rounded-full bg-[#FBFAF7] border border-[#DFE6E0] text-[10.5px] font-semibold">Student</span></td>
                    <td className="p-3.5 text-right"><span className="badge-dot badge-dot-active">Active</span></td>
                  </tr>
                  <tr className="hover:bg-[#FBFAF7] transition">
                    <td className="p-3.5 font-bold text-[#152420]">Sonia Philip</td>
                    <td className="p-3.5 text-[#8A9A94] font-mono text-[11px]">sonia.philip@college.edu</td>
                    <td className="p-3.5 text-[#51625C] font-semibold">MSc Psychology</td>
                    <td className="p-3.5 text-[#8A9A94]"><span className="px-2 py-0.5 rounded-full bg-[#FBFAF7] border border-[#DFE6E0] text-[10.5px] font-semibold">Student</span></td>
                    <td className="p-3.5 text-right"><span className="badge-dot badge-dot-active">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* =================================================================
             5. FACILITY REQUESTS TAB
        ================================================================== */}
        {activeTab === "requests" && (
          <div className="space-y-5">

            {/* Filter Pills Row */}
            <div className="flex items-center gap-1 bg-[#FBFAF7] border border-[#DFE6E0] p-1 rounded-xl w-fit flex-wrap">
              {[
                { id: "all", label: "All", count: requests.length },
                { id: "pending", label: "Pending", count: pendingRequestsCount },
                { id: "in_progress", label: "In Progress", count: inProgressRequestsCount },
                { id: "resolved", label: "Resolved", count: resolvedRequestsCount },
                { id: "rejected", label: "Rejected", count: requests.filter(r => r.status === "rejected").length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === f.id
                      ? "bg-[#1F6F5C] text-white shadow-2xs"
                      : "text-[#51625C] hover:bg-white hover:text-[#152420]"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    statusFilter === f.id ? "bg-white/20 text-white" : "bg-[#EBF0EC] text-[#51625C]"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Requests List */}
              <div className="lg:col-span-2 bg-white border border-[#DFE6E0] rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-[#152420] flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#1F6F5C]" />
                    Facility Requests List
                  </h2>
                  <span className="text-xs text-[#8A9A94]">
                    Showing {requests.filter(r => statusFilter === "all" || r.status === statusFilter).length} tickets
                  </span>
                </div>

                {requests.filter(r => statusFilter === "all" || r.status === statusFilter).length === 0 ? (
                  <div className="p-8 border border-dashed border-[#DFE6E0] rounded-xl bg-[#FBFAF7] text-center">
                    <p className="text-xs text-[#8A9A94] font-medium">No facility requests found matching '{statusFilter}'.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#DFE6E0]">
                    {requests
                      .filter(r => statusFilter === "all" || r.status === statusFilter)
                      .map((req) => (
                        <div key={req._id} className="py-4 space-y-3 hover:bg-[#FBFAF7] px-2.5 rounded-xl transition">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h4 className="font-serif font-bold text-[#152420] text-sm">{req.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#FBFAF7] border border-[#DFE6E0] text-[#51625C] font-semibold">
                                  {getCategoryLabel(req.category)}
                                </span>
                                <span className="text-[11px] text-[#8A9A94]">
                                  Location: <strong className="text-[#51625C]">{req.location}</strong>
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(req.status)}
                          </div>

                          <div className="text-xs text-[#51625C] bg-[#FBFAF7] p-3 rounded-lg border border-[#DFE6E0]">
                            <p className="leading-relaxed">{req.description}</p>
                          </div>

                          {req.adminResponse && (
                            <div className="text-xs text-[#1B5B4A] bg-[#E6F1EC] p-3 rounded-lg border border-[#D3E8DF]">
                              <strong className="block text-[10.5px] uppercase tracking-wider mb-0.5">Admin Response:</strong>
                              <p className="leading-relaxed">{req.adminResponse}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[11px] text-[#8A9A94] pt-1">
                            <span>
                              Submitted: {new Date(req.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                            <button
                              onClick={() => startEditingRequest(req)}
                              className="text-xs font-bold text-[#1F6F5C] hover:bg-[#E6F1EC] px-3 py-1 rounded-md transition cursor-pointer"
                            >
                              Manage Request →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Management Form Card */}
              <div className="lg:col-span-1">
                {editingRequest ? (
                  <div className="bg-white border border-[#DFE6E0] rounded-xl p-5 shadow-2xs space-y-4 sticky top-20 animate-scale-up">
                    <div className="border-b border-[#DFE6E0] pb-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif font-bold text-[#152420] text-sm">Update Request</h3>
                        <button
                          onClick={() => setEditingRequest(null)}
                          className="p-1 rounded-md text-[#8A9A94] hover:text-[#152420] hover:bg-[#FBFAF7] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#8A9A94] mt-0.5 truncate font-medium">{editingRequest.title}</p>
                    </div>

                    <form onSubmit={handleUpdateFacilityRequestObj} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                          Status
                        </label>
                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                          className="w-full border border-[#DFE6E0] rounded-lg px-3 py-2 text-xs font-semibold text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C]"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#51625C] uppercase tracking-wider mb-1.5">
                          Admin Response Note
                        </label>
                        <textarea
                          value={updateResponse}
                          onChange={(e) => setUpdateResponse(e.target.value)}
                          placeholder="Provide updates, schedules or resolution instructions..."
                          rows={4}
                          className="w-full border border-[#DFE6E0] rounded-lg p-3 text-xs text-[#152420] bg-white focus:outline-none focus:border-[#1F6F5C]"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingRequest(null)}
                          className="w-1/2 border border-[#DFE6E0] hover:bg-[#FBFAF7] text-[#51625C] font-semibold py-2 rounded-lg text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingUpdate}
                          className="w-1/2 bg-[#1F6F5C] hover:bg-[#134A3D] text-white font-semibold py-2 rounded-lg text-xs transition shadow-2xs disabled:bg-gray-400 cursor-pointer"
                        >
                          {submittingUpdate ? "Saving..." : "Save Updates"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-[#FBFAF7] border border-dashed border-[#DFE6E0] rounded-xl p-6 text-center text-[#8A9A94] space-y-2 sticky top-20">
                    <Wrench className="w-8 h-8 mx-auto text-[#8A9A94] opacity-60" />
                    <div>
                      <h4 className="font-bold text-[#51625C] text-xs uppercase tracking-wider">No Ticket Selected</h4>
                      <p className="text-[11px] text-[#8A9A94] mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Click "Manage Request" on any ticket on the left to resolve status or respond.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;