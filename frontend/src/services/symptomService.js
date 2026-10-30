import API from "./api";

/* Sends symptom input data to the backend for AI-based analysis */
export const submitSymptoms = (data) => {
  return API.post("/symptoms/submit", data);
};

/* Retrieves the latest symptom analysis result for the logged-in patient */
export const getLatestSymptomResult = () => {
  return API.get("/symptoms/latest");
};

/* Retrieves the patient's symptom history with optional filtering support */
export const getSymptomHistory = (filters = {}) => {
  const params = {};

  /* Adds start date filter when provided */
  if (filters.startDate) params.startDate = filters.startDate;

  /* Adds end date filter when provided */
  if (filters.endDate) params.endDate = filters.endDate;

  /* Adds risk level filter when provided */
  if (filters.riskLevel) params.riskLevel = filters.riskLevel;

  return API.get("/symptoms/history", { params });
};