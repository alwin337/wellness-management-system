import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  ArrowLeft, 
  Bot, 
  User,
  Sparkles,
  CalendarDays,
  Menu
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import { LoadingState, EmptyState, ErrorState } from "../components/dashboard/StateViews";

import { getUserProfile } from "../services/userApi";
import { 
  createConversation, 
  getConversations, 
  getConversationMessages, 
  sendMessage, 
  deleteConversation 
} from "../services/chatbotApi";

const Chatbot = () => {
  // User Profile
  const [profile, setProfile] = useState(null);

  // States
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null); // Full conversation object
  const [messages, setMessages] = useState([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  
  // Input message state
  const [inputMessage, setInputMessage] = useState("");
  
  // Mobile responsive state: true means show chat log, false means show conversation list
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Safety trigger state for current session/message
  const [currentSafety, setCurrentSafety] = useState(null); // { level, requiresEscalation }

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Fetch all conversations list
  const fetchConversationsList = async (selectFirstId = null) => {
    try {
      setLoadingList(true);
      setError(null);
      
      const res = await getConversations();
      const list = res.data.conversations || [];
      setConversations(list);

      // Optionally select a conversation
      if (selectFirstId) {
        const found = list.find(c => c._id === selectFirstId);
        if (found) {
          selectConversation(found);
        }
      } else if (list.length > 0 && !activeConversation) {
        // Don't auto-select on mobile to avoid jumping straight into chat
        if (window.innerWidth >= 768) {
          selectConversation(list[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err.response?.data?.message || "Failed to load chatbot history.");
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch Profile & Conversations on mount
  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await getUserProfile();
        setProfile(profileRes.data.user);
      } catch (err) {
        console.warn("Could not fetch user profile details");
      }
      await fetchConversationsList();
    };
    init();
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Trigger scroll whenever messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Select a conversation
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setLoadingMessages(true);
    setCurrentSafety(null);
    setShowMobileChat(true); // Switch view on mobile
    
    try {
      const res = await getConversationMessages(conversation._id);
      setMessages(res.data.messages || []);
      
      // Look at the last message to see if it was flagged with safety concern
      const list = res.data.messages || [];
      if (list.length > 0) {
        const lastMsg = list[list.length - 1];
        if (lastMsg.safetyLevel === "urgent" || lastMsg.safetyLevel === "concern") {
          setCurrentSafety({
            level: lastMsg.safetyLevel,
            requiresEscalation: lastMsg.safetyLevel === "urgent"
          });
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load chat history messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create conversation
  const handleCreateConversation = async () => {
    try {
      const title = `Chat: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
      const res = await createConversation(title);
      const newChat = res.data.conversation;
      
      toast.success("New conversation started!");
      
      // Refresh list and select the new conversation
      await fetchConversationsList(newChat._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start new conversation");
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation(); // Avoid triggering selection
    if (!window.confirm("Are you sure you want to delete this chat conversation?")) {
      return;
    }

    try {
      await deleteConversation(id);
      toast.success("Conversation deleted successfully");
      
      if (activeConversation?._id === id) {
        setActiveConversation(null);
        setMessages([]);
        setCurrentSafety(null);
        setShowMobileChat(false);
      }
      
      // Refresh list
      fetchConversationsList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete conversation");
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage(""); // Clear input immediately for responsiveness

    // Optimistically add user's message to UI list
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      sender: "student",
      message: messageText,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);
    setCurrentSafety(null);

    try {
      const res = await sendMessage(activeConversation._id, messageText);
      
      // Response contains: { message, safetyLevel, requiresEscalation, response, messageId }
      const reply = {
        _id: res.data.messageId || `reply-${Date.now()}`,
        sender: "assistant",
        message: res.data.response,
        safetyLevel: res.data.safetyLevel,
        createdAt: new Date()
      };

      setMessages(prev => {
        // Filter out any optimistic duplicates (if any) and append reply
        const clean = prev.filter(m => m._id !== tempUserMsg._id);
        return [...clean, tempUserMsg, reply];
      });

      // Update safety levels
      if (res.data.safetyLevel === "urgent" || res.data.safetyLevel === "concern") {
        setCurrentSafety({
          level: res.data.safetyLevel,
          requiresEscalation: res.data.requiresEscalation
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
      toast.error(err.response?.data?.message || "Failed to deliver message. Check backend server.");
      // Remove optimistic message on hard failure
      setMessages(prev => prev.filter(m => m._id !== tempUserMsg._id));
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role="student" user={profile}>
      <div className="flex flex-col h-[calc(100vh-140px)] border border-slate-100 rounded-3xl bg-white shadow-xl overflow-hidden animate-fade-in">
        
        <div className="flex-1 flex min-h-0 relative">
          
          {/* -------------------- LEFT PANEL: CHAT LISTINGS -------------------- */}
          <div className={`
            w-full md:w-80 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300
            ${showMobileChat ? "hidden md:flex" : "flex"}
          `}>
            {/* List header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-sm tracking-wide">Conversations</h2>
              </div>
              <button
                onClick={handleCreateConversation}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-900 rounded-xl transition cursor-pointer"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List container */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {loadingList ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-semibold">Syncing history...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">No previous conversations.</p>
                  <button 
                    onClick={handleCreateConversation}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Click to start one now.
                  </button>
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = activeConversation?._id === c._id;
                  return (
                    <div
                      key={c._id}
                      onClick={() => selectConversation(c)}
                      className={`
                        group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition duration-150
                        ${isActive 
                          ? "bg-slate-800 text-white border-l-4 border-emerald-500" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MessageSquare className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate max-w-[160px]">{c.title || "New Chat"}</p>
                          <span className="text-[10px] text-slate-500 block font-medium mt-0.5">
                            {new Date(c.lastMessageAt || c.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConversation(e, c._id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* -------------------- RIGHT PANEL: CHAT WINDOW -------------------- */}
          <div className={`
            flex-1 flex flex-col bg-slate-50 min-w-0
            ${!showMobileChat ? "hidden md:flex" : "flex"}
          `}>
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition md:hidden cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">{activeConversation.title || "MindCare AI Help"}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        Online Support Agent
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(e, activeConversation._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Log Panel */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <LoadingState message="Restoring conversation thread..." />
                    </div>
                  ) : (
                    <>
                      {messages.map((m) => {
                        const isStudent = m.sender === "student";
                        return (
                          <div
                            key={m._id}
                            className={`flex items-end gap-2.5 ${isStudent ? "justify-end" : "justify-start"}`}
                          >
                            {/* Avatar for bot */}
                            {!isStudent && (
                              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-inner">
                                <Bot className="w-4.5 h-4.5" />
                              </div>
                            )}

                            {/* Chat Bubble container */}
                            <div className="max-w-[75%] space-y-1">
                              <div className={`
                                px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm font-medium
                                ${isStudent
                                  ? "bg-emerald-600 text-white rounded-br-none"
                                  : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                                }
                              `}>
                                {m.message}
                              </div>

                              <span className={`text-[9px] font-semibold text-slate-400 block ${isStudent ? "text-right" : "text-left"}`}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            {/* Avatar for Student */}
                            {isStudent && (
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner font-bold text-xs uppercase">
                                {profile?.name ? profile.name[0] : "S"}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Safety Warning Banner Escalation */}
                      {currentSafety && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3 animate-pulse">
                          <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-rose-800 text-xs tracking-wider uppercase">Counselling Help Alert</h4>
                              <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                                The assistant detected keywords indicating intense stress or self-harm concerns. 
                                We are here to support you. You can instantly book a session with a college therapist.
                              </p>
                            </div>
                          </div>

                          <div className="pl-8 flex flex-wrap gap-2.5">
                            <a
                              href="https://www.aasra.info/"
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition shadow-sm"
                            >
                              Call AASRA Helpline (24/7)
                            </a>
                            <button
                              onClick={() => window.location.href = "/student/schedule"}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl transition shadow-sm"
                            >
                              Book Free Slot
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Bouncing typing indicator */}
                      {sending && (
                        <div className="flex items-end gap-2.5 justify-start">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                            <Bot className="w-4.5 h-4.5" />
                          </div>
                          
                          <div className="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Text Form Box */}
                <div className="p-4 bg-white border-t border-slate-100 z-10 shadow-inner">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Share what is on your mind (e.g. stress, exam worries)..."
                      disabled={sending}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 text-slate-800 disabled:opacity-60 transition"
                    />
                    
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sending}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition shrink-0 flex items-center justify-center shadow-md shadow-emerald-600/10 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // Empty State (no active chat selected)
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition md:hidden absolute left-4 top-4 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-md border border-emerald-100">
                  <Bot className="w-10 h-10 animate-bounce" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-800">MindCare AI Wellness Companion</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Start a confidential conversation about study stress, sleep, time management, or emotional coping skills. 
                    Your conversation history is privately stored for you.
                  </p>
                </div>

                <button
                  onClick={handleCreateConversation}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Start New Conversation
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Chatbot;
