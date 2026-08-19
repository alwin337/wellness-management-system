import API from "../api/axios";

export const getUserProfile = () => {
  return API.get("/users/profile");
};

export const updateUserProfile = (userData) => {
  return API.put("/users/profile", userData);
};
