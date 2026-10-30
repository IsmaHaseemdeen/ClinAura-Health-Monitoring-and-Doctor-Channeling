import API from "./api";

/* Sends a new inquiry or contact message to the backend */
export const createInquiry = (data) => {
  return API.post("/inquiries", data);
};

/* Retrieves inquiries submitted by the logged-in user */
export const getMyInquiries = () => {
  return API.get("/inquiries/my");
};

/* Retrieves all inquiries for admin review and management */
export const getAllInquiries = () => {
  return API.get("/inquiries");
};

/* Sends an admin reply to a specific inquiry */
export const replyToInquiry = (id, data) => {
  return API.put(`/inquiries/${id}/reply`, data);
};