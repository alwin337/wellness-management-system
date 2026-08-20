import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Wind, 
  Video, 
  Volume2, 
  Compass, 
  Lightbulb, 
  Search, 
  Sparkles, 
  Plus, 
  X, 
  Clock, 
  Activity, 
  User, 
  Heart,
  ChevronRight,
  Filter
} from "lucide-react";
import { toast } from "react-toastify";
import { getResources, createResource } from "../services/resourceApi";
import Button from "../components/Button";
import InputField from "../components/InputField";

export default function Resources() {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  let user = null;
  if (token && userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }

  const isAdmin = user && user.role === "admin";

  // State
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Create Resource Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingResource, setSubmittingResource] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "article",
    category: "general",
    content: "",
    mediaUrl: "",
    thumbnailUrl: "",
    duration: "",
    difficulty: "beginner"
  });

  // Resource Viewer Modal State
  const [selectedResource, setSelectedResource] = useState(null);

  // Interactive Breathing Visualizer State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale"); // inhale, hold, exhale
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Fetch Resources
  const fetchResourcesList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getResources();
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError(err.response?.data?.message || "Failed to load wellness resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesList();
  }, []);

  // Breathing Visualizer Loop
  useEffect(() => {
    let interval = null;
    let secondsLeft = 4;

    if (breathingActive) {
      setBreathingSeconds(4);
      setBreathingPhase("inhale");

      interval = setInterval(() => {
        secondsLeft -= 1;
        setBreathingSeconds(secondsLeft);

        if (secondsLeft <= 0) {
          // Transition phases: Inhale (4s) -> Hold (4s) -> Exhale (4s)
          setBreathingPhase((prevPhase) => {
            if (prevPhase === "inhale") {
              secondsLeft = 4;
              return "hold";
            } else if (prevPhase === "hold") {
              secondsLeft = 4;
              return "exhale";
            } else {
              secondsLeft = 4;
              return "inhale";
            }
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [breathingActive]);

  // Form Change Handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit Resource Handler
  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.type || !formData.category) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setSubmittingResource(true);
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      await createResource(payload);
      toast.success("Wellness resource published successfully!");
      setShowCreateModal(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        type: "article",
        category: "general",
        content: "",
        mediaUrl: "",
        thumbnailUrl: "",
        duration: "",
        difficulty: "beginner"
      });

      // Refresh list
      fetchResourcesList();
    } catch (err) {
      console.error("Create resource error:", err);
      toast.error(err.response?.data?.message || "Failed to publish resource");
    } finally {
      setSubmittingResource(false);
    }
  };

  // Helper: Get type display name & icon
  const getTypeMeta = (type) => {
    switch (type) {
      case "article":
        return { label: "Article", icon: BookOpen, color: "text-blue-600 bg-blue-50 border-blue-100" };
      case "breathing_exercise":
        return { label: "Breathing Exercise", icon: Wind, color: "text-teal-600 bg-teal-50 border-teal-100" };
      case "meditation":
        return { label: "Meditation", icon: Activity, color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      case "video":
        return { label: "Video Session", icon: Video, color: "text-rose-600 bg-rose-50 border-rose-100" };
      case "audio":
        return { label: "Audio Guide", icon: Volume2, color: "text-violet-600 bg-violet-50 border-violet-100" };
      case "guide":
        return { label: "Handbook", icon: Compass, color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
      case "tip":
        return { label: "Wellness Tip", icon: Lightbulb, color: "text-amber-600 bg-amber-50 border-amber-100" };
      default:
        return { label: "Resource", icon: BookOpen, color: "text-slate-600 bg-slate-50 border-slate-100" };
    }
  };

  // Helper: Get category display label
  const getCategoryLabel = (category) => {
    const mapper = {
      stress: "Stress Management",
      anxiety: "Anxiety Relief",
      depression: "Depression Support",
      sleep: "Sleep & Rest",
      mindfulness: "Mindfulness",
      self_care: "Self Care",
      general: "General Wellness"
    };
    return mapper[category] || "Wellness";
  };

  // Filter logic
  const filteredResources = resources.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || r.type === selectedType;
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-32 px-4 sm:px-8 lg:px-12 z-20 pb-24 font-sans">
      
      {/* Container Card Wrapper */}
      <div className="max-w-6xl w-full bg-white/70 backdrop-blur-md border border-slate-200/50 p-6 sm:p-10 rounded-3xl shadow-xl space-y-8 mt-4">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6 border-slate-200/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-extrabold uppercase tracking-widest text-[10px]">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              MindCare Support Material
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Wellness Resources
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl leading-relaxed">
              Browse guides, relaxation meditations, and support articles curated by wellness professionals.
            </p>
          </div>

          {/* Admin Add Resource Trigger */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-emerald-600/15 transition cursor-pointer self-stretch md:self-auto justify-center"
            >
              <Plus className="w-4.5 h-4.5" />
              Add New Resource
            </motion.button>
          )}
        </div>

        {/* Filter and Search Layout (Aesthetic Unified Panel) */}
        <div className="space-y-5 bg-slate-50/50 border border-slate-200/40 p-4 sm:p-5 rounded-2xl">
          
          {/* Row 1: Search & Format Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input Box */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, keywords, etc..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm font-medium text-slate-700"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type/Format Pill tabs bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { val: "all", label: "All Formats" },
                { val: "article", label: "Articles" },
                { val: "breathing_exercise", label: "Breathing" },
                { val: "meditation", label: "Meditations" },
                { val: "video", label: "Videos" },
                { val: "audio", label: "Audios" },
                { val: "guide", label: "Guides" },
                { val: "tip", label: "Tips" }
              ].map((type) => (
                <button
                  key={type.val}
                  onClick={() => setSelectedType(type.val)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer border ${
                    selectedType === type.val
                      ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                      : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Category Filter Bar */}
          <div className="flex items-center gap-2 border-t pt-4 border-slate-200/50">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Category:
            </span>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { val: "all", label: "All Topics" },
                { val: "stress", label: "Stress Management" },
                { val: "anxiety", label: "Anxiety Relief" },
                { val: "depression", label: "Depression Support" },
                { val: "sleep", label: "Sleep & Rest" },
                { val: "mindfulness", label: "Mindfulness" },
                { val: "self_care", label: "Self Care" }
              ].map((cat) => (
                <button
                  key={cat.val}
                  onClick={() => setSelectedCategory(cat.val)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition border ${
                    selectedCategory === cat.val
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-[#7cb342] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-[#7cb342] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-[#7cb342] rounded-full animate-bounce"></div>
            </div>
            <p className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider animate-pulse">Loading wellness guides...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-10 border border-red-100 rounded-2xl bg-red-550/5 text-center max-w-md mx-auto">
            <Heart className="w-10 h-10 text-red-500 mb-3 animate-pulse" />
            <h3 className="font-extrabold text-red-700 text-base">Unable to Load Data</h3>
            <p className="text-xs text-red-500 mt-2 font-medium leading-relaxed">{error}</p>
            <button
              onClick={fetchResourcesList}
              className="mt-5 px-5 py-2 bg-red-655 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Resources Grid List (Full Width 3-Column Layout) */}
        {!loading && !error && (
          <>
            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 text-center max-w-md mx-auto">
                <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                  <Compass className="w-7 h-7 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No Resources Found</h3>
                <p className="text-xs text-slate-550 mt-1 font-medium max-w-xs leading-relaxed">
                  No published resource matches your criteria. Try adjusting your search query or choosing another category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((r, index) => {
                  const typeMeta = getTypeMeta(r.type);
                  const Icon = typeMeta.icon;

                  return (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                      className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      onClick={() => setSelectedResource(r)}
                    >
                      <div className="space-y-4">
                        {/* Tags / Meta Bar */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${typeMeta.color}`}>
                            <Icon className="w-3 h-3" />
                            {typeMeta.label}
                          </span>
                          
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {getCategoryLabel(r.category)}
                          </span>
                        </div>

                        {/* Title and Short description */}
                        <div className="space-y-1.5 text-left">
                          <h3 className="text-base font-extrabold text-slate-800 leading-snug tracking-tight group-hover:text-emerald-700 transition">
                            {r.title}
                          </h3>
                          <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed font-medium">
                            {r.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Details */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          {r.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {r.duration} Min
                            </span>
                          )}
                          {r.difficulty && (
                            <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-slate-500">
                              {r.difficulty}
                            </span>
                          )}
                        </div>

                        <span className="flex items-center gap-0.5 text-emerald-600 group-hover:translate-x-0.5 transition duration-200">
                          Practice
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>

      {/* =============================================================== */}
      {/* RESOURCE DETAIL VIEW MODAL */}
      {/* =============================================================== */}
      <AnimatePresence>
        {selectedResource && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setSelectedResource(null);
              setBreathingActive(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcfaf2] border border-[#dfe5d5] rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden p-6 sm:p-8 flex flex-col justify-between relative"
            >
              {/* Header block */}
              <div className="flex items-start justify-between border-b border-[#dfe5d5] pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-[#e9eddf] p-2.5 rounded-xl border border-[#dfe5d5] text-[#7cb342]">
                    {React.createElement(getTypeMeta(selectedResource.type).icon, { className: "w-5 h-5" })}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-800 leading-tight">
                      {selectedResource.title}
                    </h3>
                    <span className="text-[9px] font-extrabold text-[#7cb342] uppercase tracking-widest">
                      {getCategoryLabel(selectedResource.category)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedResource(null);
                    setBreathingActive(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Modal scrollable body content */}
              <div className="space-y-6 text-left overflow-y-auto pr-1 flex-grow mb-4 scrollbar-hide">
                
                {/* Visualizer Breathing Guide */}
                {selectedResource.type === "breathing_exercise" && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex flex-col items-center justify-center space-y-5">
                    <div className="text-center">
                      <h4 className="font-extrabold text-xs text-emerald-800">Visual Breath Pacing</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">Focus on your breathing. Match your cycle to the guide circle.</p>
                    </div>

                    {/* Animated Circle Container */}
                    <div className="h-32 flex items-center justify-center relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={breathingPhase}
                          animate={{
                            scale: breathingPhase === "inhale" ? 1.35 : breathingPhase === "hold" ? 1.35 : 0.8,
                            backgroundColor: breathingPhase === "inhale" ? "#8bc34a" : breathingPhase === "hold" ? "#fbc02d" : "#00bcd4"
                          }}
                          transition={{ duration: 3.8, ease: "easeInOut" }}
                          className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white font-black text-xs shadow-lg shadow-emerald-500/10 relative"
                        >
                          <span className="capitalize">{breathingPhase}</span>
                          <span className="text-[10px] font-normal mt-0.5">{breathingSeconds}s</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => setBreathingActive(!breathingActive)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-extrabold transition cursor-pointer shadow-sm ${
                        breathingActive 
                          ? "bg-slate-800 text-white hover:bg-slate-700" 
                          : "bg-[#7cb342] text-white hover:bg-[#689f38]"
                      }`}
                    >
                      {breathingActive ? "Pause Practice" : "Begin Breathing"}
                    </button>
                  </div>
                )}

                {/* Media Players (Videos & Audios) */}
                {selectedResource.mediaUrl && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[#7cb342] uppercase tracking-wider">Multimedia Playback</h4>
                    
                    {selectedResource.type === "video" ? (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                        <iframe
                          src={selectedResource.mediaUrl}
                          title={selectedResource.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : selectedResource.type === "audio" ? (
                      <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
                        <audio 
                          controls 
                          src={selectedResource.mediaUrl} 
                          className="w-full focus:outline-none" 
                        />
                      </div>
                    ) : (
                      <a
                        href={selectedResource.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Launch External Attachment Resource Link
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Full Article Content */}
                <div className="space-y-2 leading-relaxed">
                  <h4 className="text-[10px] font-bold text-[#7cb342] uppercase tracking-wider">Practice Details & Guidelines</h4>
                  <p className="text-slate-700 text-xs sm:text-sm font-medium whitespace-pre-line leading-relaxed">
                    {selectedResource.content || selectedResource.description}
                  </p>
                </div>
              </div>

              {/* Bottom Details Footer */}
              <div className="pt-4 border-t border-[#dfe5d5] flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Shared by {selectedResource.createdBy?.name || "Support Cell"}
                </span>

                <button
                  onClick={() => {
                    setSelectedResource(null);
                    setBreathingActive(false);
                  }}
                  className="px-4 py-2 bg-white border border-[#dfe5d5] hover:bg-[#e9eddf]/50 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =============================================================== */}
      {/* ADMIN CREATE RESOURCE MODAL */}
      {/* =============================================================== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start border-b pb-4 mb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Publish New Wellness Resource</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Share articles, exercises, or materials to support student wellness.</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleCreateResource} className="space-y-4 text-left overflow-y-auto pr-1 flex-grow mb-4 scrollbar-hide">
                
                {/* Title */}
                <InputField
                  label="Resource Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Mindfulness & Breathing Practices"
                  required
                />

                {/* Description */}
                <InputField
                  label="Short Summary Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Summarize what this resource covers..."
                  required
                />

                {/* Type & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Format Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                      required
                    >
                      <option value="article">Article / Readings</option>
                      <option value="breathing_exercise">Breathing Exercise</option>
                      <option value="meditation">Guided Meditation</option>
                      <option value="video">Video Session Link</option>
                      <option value="audio">Audio Guide Link</option>
                      <option value="guide">Counselling Handbook</option>
                      <option value="tip">Daily Quick Tip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Category Topic *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                      required
                    >
                      <option value="general">General Wellness</option>
                      <option value="stress">Stress Management</option>
                      <option value="anxiety">Anxiety Relief</option>
                      <option value="depression">Depression Support</option>
                      <option value="sleep">Sleep & Rest</option>
                      <option value="mindfulness">Mindfulness Practice</option>
                      <option value="self_care">Self Care Routine</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Duration (Minutes)"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    placeholder="e.g., 5"
                    min="1"
                  />

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Target Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleFormChange}
                      className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Media URL */}
                <InputField
                  label="Media URL / Video Embed Link (Optional)"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleFormChange}
                  placeholder="e.g., https://www.youtube.com/embed/..."
                />

                {/* Detailed guidelines */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Detailed Guidelines / Full Article Body Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    placeholder="Add step-by-step guidance instructions, full article text, or tips details..."
                    rows={4}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

              </form>

              {/* Actions Footer */}
              <div className="pt-4 border-t flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 border border-slate-200 text-slate-600 hover:bg-slate-50 py-3 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateResource}
                  disabled={submittingResource}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/10 transition disabled:bg-slate-300 cursor-pointer"
                >
                  {submittingResource ? "Publishing..." : "Publish Resource"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
