import API from "../api/axios";

// Student submits a facility request
export const createFacilityRequest = (requestData) => {
  return API.post("/requests", requestData);
};

// Admin retrieves all facility requests
export const getAllFacilityRequests = () => {
  return API.get("/requests");
};

// Admin updates facility request status and response
export const updateFacilityRequest = (id, updateData) => {
  return API.put(`/requests/${id}`, updateData);
};
