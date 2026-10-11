import API from "../api/axios";

export const getAllCounsellors = () => {
  return API.get("/counsellors");
};

export const getAvailableCounsellors = () => {
  return API.get("/available-counsellors");
};

export const getActiveCounsellors = () => {
  return API.get("/available-counsellors");
};

export const getCounsellor = (id) => {
  return API.get(`/counsellors/${id}`);
};

export const addCounsellor = (counsellorData) => {
  return API.post("/counsellors", counsellorData);
};

export const updateCounsellor = (id, counsellorData) => {
  return API.put(`/counsellors/${id}`, counsellorData);
};

export const deactivateCounsellor = (id) => {
  return API.patch(`/counsellors/${id}/deactivate`);
};

export const activateCounsellor = (id) => {
  return API.patch(`/counsellors/${id}/activate`);
};

export const deleteCounsellor = (id) => {
  return API.delete(`/counsellors/${id}`);
};

