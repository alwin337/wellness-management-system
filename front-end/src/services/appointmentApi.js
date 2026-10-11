import API from "../api/axios";

export const createAppointment = (appointmentData) => {
  return API.post("/appointments", appointmentData);
};

export const getMyAppointments = () => {
  return API.get("/appointments/my");
};

export const cancelMyAppointment = (id) => {
  return API.patch(`/appointments/my/${id}/cancel`);
};

export const getMyAppointmentById = (id) => {
  return API.get(`/appointments/my/${id}`);
};

export const getCounsellorAppointments = () => {
  return API.get("/appointments/counsellor");
};

export const getCounsellorAppointmentById = (id) => {
  return API.get(`/appointments/counsellor/${id}`);
};

export const updateAppointmentStatus = (id, status) => {
  return API.patch(`/appointments/counsellor/${id}/status`, { status });
};

