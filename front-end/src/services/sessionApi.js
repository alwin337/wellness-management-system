import API from "../api/axios";

// Create a session from a confirmed appointment
export const createSession = (appointmentId, notes = "") => {
  return API.post("/sessions", {
    appointmentId,
    notes,
  });
};

// Get past appointments of the logged-in counsellor
export const getPastAppointments = () => {
  return API.get("/sessions/past-appointments");
};

// Get all sessions of the logged-in counsellor
export const getMySessions = () => {
  return API.get("/sessions/my");
};

// Get session history of a particular student
export const getStudentSessionHistory = (studentId) => {
  return API.get(`/sessions/student/${studentId}`);
};

// Send feedback for a session
export const sendFeedback = (sessionId, feedback) => {
  return API.put(`/sessions/${sessionId}/feedback`, {
    feedback,
  });
};

// Get a single session
export const getSession = (sessionId) => {
  return API.get(`/sessions/${sessionId}`);
};