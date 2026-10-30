import API from "./api";

/* Retrieves all appointments for system-wide admin monitoring */
export const getAllAppointments = () => {
  return API.get("/admin/appointments");
};

/* Updates an appointment decision such as confirm, reject, or complete */
export const updateAdminAppointmentDecision = (id, data) => {
  return API.put(`/admin/appointments/${id}`, data);
};

/* Retrieves the admin payment approval queue using the appointment source */
export const getAdminPaymentApprovals = () => {
  return API.get("/admin/appointments");
};

/* Builds the backend URL used by admins to view an uploaded payment receipt */
export const getReceiptViewUrl = (id) => {
  return `http://localhost:5284/api/admin/appointments/${id}/receipt`;
};

/* Sends a request to register a new doctor in the system */
export const registerDoctor = (data) => {
  return API.post("/admin/doctors", data);
};

/* Retrieves the full list of registered doctors for admin management */
export const getAllDoctors = () => {
  return API.get("/admin/doctors");
};

/* Retrieves the full list of patients for admin viewing and management */
export const getAllPatients = () => {
  return API.get("/admin/patients");
};