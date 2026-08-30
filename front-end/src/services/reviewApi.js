import API from "../api/axios";

// Student submits a review
export const createReview = (reviewData) => {
  return API.post("/reviews", reviewData);
};

// Counsellor retrieves their anonymous reviews
export const getCounsellorReviews = () => {
  return API.get("/reviews/counsellor");
};
