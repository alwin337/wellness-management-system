import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  HeartHandshake
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";
import Button from "../components/Button";

import { getUserProfile } from "../services/userApi";
import { 
  getAssessments, 
  getAssessment, 
  submitAssessment, 
  getMyResults, 
  getAssessmentResult 
} from "../services/assessmentApi";

const Assessments = () => {
  // Navigation views: "list", "take", "result"
  const [view, setView] = useState("list"); 
  const [activeTab, setActiveTab] = useState("available"); // "available" or "history"

  // User Profile
  const [profile, setProfile] = useState(null);

  // States
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Assessment being taken
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionId]: score }
  const [submitting, setSubmitting] = useState(false);

  // Selected Result details to view
  const [selectedResult, setSelectedResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  // Initial Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      try {
        const profileRes = await getUserProfile();
        setProfile(profileRes.data.user);
      } catch (err) {
        console.warn("Could not fetch user profile, using fallback details");
      }

      // Fetch active assessments & history
      const [assessmentsRes, historyRes] = await Promise.all([
        getAssessments(),
        getMyResults()
      ]);

      setAssessments(assessmentsRes.data.assessments || []);
      setHistory(historyRes.data.results || []);
    } catch (err) {
      console.error("Error loading assessment data:", err);
      setError(err.response?.data?.message || "Failed to load wellness assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Assessment Selection to Start
  const startAssessment = async (id) => {
    try {
      setLoading(true);
      const res = await getAssessment(id);
      setSelectedAssessment(res.data.assessment);
      setAnswers({}); // Clear answers
      setView("take");
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start assessment");
    } finally {
      setLoading(false);
    }
  };

  // Handle Option Selection
  const handleSelectOption = (questionId, score) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  // Submit responses
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    // Validate that all questions are answered
    const unanswered = selectedAssessment.questions.filter(
      q => answers[q.questionId] === undefined
    );

    if (unanswered.length > 0) {
      toast.error(`Please answer all questions before submitting. (${unanswered.length} remaining)`);
      return;
    }

    try {
      setSubmitting(true);
      // Map answers to the format expected by the backend scoring service: [{ questionId, score }]
      const payloadAnswers = selectedAssessment.questions.map(q => ({
        questionId: q.questionId,
        score: answers[q.questionId]
      }));

      const res = await submitAssessment(selectedAssessment._id, payloadAnswers);
      toast.success("Assessment submitted successfully!");
      
      // Load details of the submitted result directly
      setSelectedResult(res.data.result);
      setView("result");
      
      // Refresh list & history in background
      fetchData();
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit assessment answers.");
    } finally {
      setSubmitting(false);
    }
  };

  // View specific result from history
  const viewResultDetails = async (resultId) => {
    try {
      setResultLoading(true);
      const res = await getAssessmentResult(resultId);
      setSelectedResult(res.data.result);
      setView("result");
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load result details");
    } finally {
      setResultLoading(false);
    }
  };

  // Back to Main list
  const resetToMain = () => {
    setSelectedAssessment(null);
    setSelectedResult(null);
    setAnswers({});
    setView("list");
  };

  // Category visual helper
  const getCategoryBadge = (category) => {
    const categories = {
      stress: { label: "Stress Control", bg: "bg-orange-50 text-orange-700 border-orange-200" },
      anxiety: { label: "Anxiety screening", bg: "bg-rose-50 text-rose-700 border-rose-200" },
      mood: { label: "Mood & Affect", bg: "bg-purple-50 text-purple-700 border-purple-200" },
      academic_stress: { label: "Academic Stress", bg: "bg-blue-50 text-blue-700 border-blue-200" },
      sleep: { label: "Sleep Hygiene", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      general_wellbeing: { label: "General Wellbeing", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" }
    };
    const details = categories[category] || { label: category, bg: "bg-slate-50 text-slate-700 border-slate-200" };
    return (
      <span className={`inline-flex border px-2.5 py-0.5 rounded-full text-xs font-semibold ${details.bg}`}>
        {details.label}
      </span>
    );
  };

  // Severity Level Badge Visualizer
  const getSeverityBadge = (level) => {
    const lvl = (level || "").toLowerCase();
    let bg = "bg-slate-100 text-slate-800 border-slate-200";
    if (lvl.includes("minimal") || lvl.includes("low") || lvl.includes("normal") || lvl.includes("healthy")) {
      bg = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (lvl.includes("mild")) {
      bg = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (lvl.includes("moderate")) {
      bg = "bg-orange-100 text-orange-800 border-orange-300";
    } else if (lvl.includes("severe") || lvl.includes("high") || lvl.includes("urgent")) {
      bg = "bg-rose-100 text-rose-800 border-rose-300 animate-pulse";
    }
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${bg} tracking-wide uppercase`}>
        {level}
      </span>
    );
  };

  // Render Loader
  if (loading && view !== "take") {
    return (
      <DashboardLayout role="student" user={profile}>
        <LoadingState message="Loading assessments details..." />
      </DashboardLayout>
    );
  }

  // Render Error
  if (error && view === "list") {
    return (
      <DashboardLayout role="student" user={profile}>
        <ErrorState message={error} onRetry={fetchData} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" user={profile}>
      <div className="space-y-8 animate-fade-in pb-12">

        {/* -------------------- 1. MAIN LIST VIEW -------------------- */}
        {view === "list" && (
          <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-100">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Wellness Portal</span>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">Student Assessments</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Evaluate your wellbeing with validated psychological screening tools.
                </p>
              </div>

              {/* Tab selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab("available")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    activeTab === "available" 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Available Tests
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    activeTab === "history" 
                      ? "bg-white text-slate-800 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Past History ({history.length})
                </button>
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-emerald-500 text-white p-2.5 rounded-xl mt-0.5 shadow-md shadow-emerald-500/10 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <h4 className="font-bold text-slate-800">Supportive Wellness Checkups</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  These surveys are simple tools to help identify potential emotional struggles (stress, sleep disorders, anxiety, mood issues). 
                  They are completely confidential and the results are only visible to you. Sharing details with a college counsellor is optional but encouraged.
                </p>
              </div>
            </div>

            {/* Active Tab rendering */}
            {activeTab === "available" ? (
              assessments.length === 0 ? (
                <EmptyState 
                  message="No active assessments available" 
                  subtitle="Please check back later or contact the Counselling Cell." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assessments.map((a) => (
                    <div 
                      key={a._id}
                      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          {getCategoryBadge(a.category)}
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            {a.instrument?.name || "Scale"}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-snug">{a.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                            {a.description || "Take this test to evaluate your score."}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Layers className="w-4 h-4 text-slate-300" />
                            {a.questions?.length || 0} items
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-300" />
                            ~{Math.max(1, Math.round((a.questions?.length || 0) * 0.5))} min
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={() => startAssessment(a._id)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Start Assessment
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Results History List
              history.length === 0 ? (
                <EmptyState 
                  message="No past results found" 
                  subtitle="Your completed assessment history will appear here once you take your first test." 
                />
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 uppercase tracking-widest text-[10px] font-bold border-b border-slate-100 bg-slate-50/50">
                          <th className="py-4 px-6 font-semibold">Test Name</th>
                          <th className="py-4 px-6 font-semibold">Category</th>
                          <th className="py-4 px-6 font-semibold">Date Completed</th>
                          <th className="py-4 px-6 font-semibold text-center">Score</th>
                          <th className="py-4 px-6 font-semibold text-center">Level</th>
                          <th className="py-4 px-6 font-semibold text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((h) => (
                          <tr key={h._id} className="hover:bg-slate-50/30 transition">
                            <td className="py-4 px-6 font-bold text-slate-800">
                              {h.assessmentId?.title || h.instrumentName || "Mental Wellness Survey"}
                            </td>
                            <td className="py-4 px-6">
                              {getCategoryBadge(h.assessmentId?.category || "general_wellbeing")}
                            </td>
                            <td className="py-4 px-6 text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-300" />
                                {new Date(h.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center font-semibold text-slate-700">
                              {h.totalScore} <span className="text-xs text-slate-400">/ {h.maxScore}</span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                h.level.toLowerCase().includes("severe") || h.level.toLowerCase().includes("high")
                                  ? "bg-rose-50 text-rose-700"
                                  : h.level.toLowerCase().includes("moderate")
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {h.level}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => viewResultDetails(h._id)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                View Results
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* -------------------- 2. TAKE ASSESSMENT VIEW -------------------- */}
        {view === "take" && selectedAssessment && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Header & Back Button */}
            <div className="space-y-4">
              <button
                onClick={resetToMain}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Available Tests
              </button>

              <div className="border-b pb-5 border-slate-100">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  Active Survey
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  {selectedAssessment.title}
                </h1>
                {selectedAssessment.instrument?.name && (
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    Instrument Scale: {selectedAssessment.instrument.name} {selectedAssessment.instrument.version && `(v${selectedAssessment.instrument.version})`}
                  </p>
                )}
              </div>
            </div>

            {/* Instructions box */}
            {selectedAssessment.instructions && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-sm leading-relaxed text-slate-600 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-500" />
                  Instructions
                </h4>
                <p>{selectedAssessment.instructions}</p>
              </div>
            )}

            {/* Questions Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question list */}
              {selectedAssessment.questions
                .sort((a, b) => a.order - b.order)
                .map((q, idx) => {
                  const isAnswered = answers[q.questionId] !== undefined;

                  return (
                    <div 
                      key={q.questionId}
                      className={`bg-white border rounded-2xl p-6 transition duration-200 shadow-sm space-y-4 ${
                        isAnswered ? "border-slate-200 bg-white" : "border-slate-200/70"
                      }`}
                    >
                      {/* Question Text */}
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base leading-relaxed">
                          {q.text}
                        </h4>
                      </div>

                      {/* Question options */}
                      {q.inputType === "option" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-9">
                          {q.options.map((opt) => {
                            const isSelected = answers[q.questionId] === opt.score;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleSelectOption(q.questionId, opt.score)}
                                className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition duration-150 cursor-pointer ${
                                  isSelected 
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500"
                                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{opt.label}</span>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fallback Input Types */}
                      {q.inputType === "number" && (
                        <div className="pl-9 pt-1 max-w-xs">
                          <input
                            type="number"
                            min={selectedAssessment.scoring?.responseMin ?? 0}
                            max={selectedAssessment.scoring?.responseMax ?? 100}
                            value={answers[q.questionId] ?? ""}
                            onChange={(e) => handleSelectOption(q.questionId, Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Enter a number..."
                          />
                        </div>
                      )}

                      {q.inputType === "time" && (
                        <div className="pl-9 pt-1 max-w-xs">
                          <input
                            type="time"
                            value={answers[q.questionId] ?? ""}
                            onChange={(e) => handleSelectOption(q.questionId, e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      )}

                      {q.inputType === "text" && (
                        <div className="pl-9 pt-1">
                          <textarea
                            rows={3}
                            value={answers[q.questionId] ?? ""}
                            onChange={(e) => handleSelectOption(q.questionId, e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Type your response..."
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Progress & Submit Block */}
              <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Completion Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">
                      {Object.keys(answers).length} / {selectedAssessment.questions.length}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">questions answered</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto min-w-[200px]">
                  <Button
                    type="submit"
                    text={submitting ? "Analyzing answers..." : "Submit Answers"}
                    disabled={submitting || Object.keys(answers).length < selectedAssessment.questions.length}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 py-3 cursor-pointer"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* -------------------- 3. RESULT VIEW -------------------- */}
        {view === "result" && selectedResult && (
          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Header & Back Button */}
            <div className="space-y-4">
              <button
                onClick={resetToMain}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>

              <div className="border-b pb-5 border-slate-100">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  Assessment Score Report
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  {selectedResult.assessmentId?.title || selectedResult.assessment || "Wellness Assessment"}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Completed on: {new Date(selectedResult.createdAt || selectedResult.completedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </p>
              </div>
            </div>

            {/* Score Showcase Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              {/* Colored top bar */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <div className="p-8 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl text-emerald-600 mb-2">
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-widest block">Total Score</span>
                  <div className="text-5xl font-black text-slate-800 tracking-tight">
                    {selectedResult.totalScore ?? selectedResult.score}{" "}
                    <span className="text-2xl text-slate-300 font-medium">/ {selectedResult.maxScore}</span>
                  </div>
                  {selectedResult.percentage !== undefined && (
                    <div className="text-sm font-semibold text-slate-500 pt-0.5">
                      Percentage score: {selectedResult.percentage}%
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Wellbeing classification</div>
                  {getSeverityBadge(selectedResult.level)}
                </div>

                {/* Score Interpretation */}
                <div className="border-t border-slate-100 pt-6 text-left space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Interpretation</h4>
                  <p className="text-slate-600 text-[14px] leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                    {selectedResult.resultDescription || selectedResult.description || "Your screening is successfully completed. Details are available on this dashboard."}
                  </p>
                </div>

                {/* Recommendations */}
                {(selectedResult.recommendation) && (
                  <div className="text-left space-y-3 pt-2">
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Counselling Recommendations</h4>
                    <p className="text-slate-600 text-[14px] leading-relaxed font-medium bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      {selectedResult.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Disclaimer Alert */}
            <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-5 flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1.5 leading-relaxed font-medium">
                <h5 className="font-bold">Important Wellness Disclaimer</h5>
                <p>
                  This assessment is an educational wellness screening helper and **NOT** a professional clinical diagnosis or medical evaluation. 
                  Symptoms can fluctuate, and scores should be evaluated in context with a certified professional.
                </p>
                <p>
                  If you are experiencing strong academic stress, persistent low mood, or anxiety, please coordinate a confidential appointment with our 
                  counsellors under the **Book Slots** tab of your Student Portal.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center pt-2">
              <button
                onClick={resetToMain}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Return to Assessments Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Assessments;
