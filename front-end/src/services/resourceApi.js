import API from "../api/axios";

export const getResources = (params) => {
  return API.get("/resources", { params });
};

export const createResource = (resourceData) => {
  return API.post("/resources", resourceData);
};
