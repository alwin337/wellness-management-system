import API from "../api/axios";

export const getCounsellingStatistics = () => {
  return API.get("/statistics");
};