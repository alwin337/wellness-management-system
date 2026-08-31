import API from "../api/axios";

export const createSession = (appointmentId, notes = "") => {
  return API.post("/sessions", {
    appointmentId,
    notes,
  });
};

export const getPastAppointments = () => {
  return API.get("/sessions/past-appointments");
};

export const getMySessions = () => {
  return API.get("/sessions/my");
};

export const getStudentSessionHistory = () => {
  return API.get("/sessions/my/history");
};

export const sendFeedback = (sessionId, feedback) => {
  return API.put(`/sessions/${sessionId}/feedback`, {
    feedback,
  });
};

export const getSession = (sessionId) => {
  return API.get(`/sessions/${sessionId}`);
};