import API from "../api/axios";

export const getAllSchedules = () => {
  return API.get("/schedules");
};

export const getCounsellorSchedules = (counsellorId) => {
  return API.get(`/schedules/counsellor/${counsellorId}`);
};

export const addSchedule = (scheduleData) => {
  return API.post("/schedules", scheduleData);
};

export const updateSchedule = (id, scheduleData) => {
  return API.put(`/schedules/${id}`, scheduleData);
};

export const deleteSchedule = (id) => {
  return API.delete(`/schedules/${id}`);
};
