import API from "../api/axios";

// Get all active assessments
export const getAssessments = () => {
  return API.get("/assessments");
};

// Get a single assessment by ID (with questions)
export const getAssessment = (id) => {
  return API.get(`/assessments/${id}`);
};

// Submit assessment answers
export const submitAssessment = (id, answers) => {
  return API.post(`/assessments/${id}/submit`, { answers });
};

// Get logged-in student's assessment results history
export const getMyResults = () => {
  return API.get("/assessments/my-results");
};

// Get details of a specific assessment result by ID
export const getAssessmentResult = (id) => {
  return API.get(`/assessments/results/${id}`);
};
