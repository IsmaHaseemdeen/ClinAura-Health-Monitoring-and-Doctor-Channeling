import API from "./api";

/* Retrieves the profile details of the logged-in doctor */
export const getDoctorProfile = () => {
  return API.get("/doctor/profile");
};

/* Updates the profile details of the logged-in doctor */
export const updateDoctorProfile = (data) => {
  return API.put("/doctor/profile", data);
};

/* Retrieves appointments assigned to the logged-in doctor */
export const getDoctorAppointments = () => {
  return API.get("/doctor/appointments");
};

/* Updates the status of a specific appointment */
export const updateAppointment = (id, data) => {
  return API.put(`/appointments/${id}/status`, data);
};

/* Adds a consultation note for a patient after or during an appointment */
export const addConsultationNote = (data) => {
  return API.post("/doctor/consultation-notes", data);
};

/* Retrieves notifications relevant to the logged-in doctor */
export const getDoctorNotifications = () => {
  return API.get("/notifications");
};

/* Retrieves a patient health record file as a blob for document viewing or download */
export const getDoctorDocumentBlob = (id) => {
  return API.get(`/doctor/health-records/${id}/view`, {
    responseType: "blob"
  });
};

/* Retrieves the doctor's patient list for patient management pages */
export const getPatients = () => {
  return API.get("/doctor/patients");
};

/* Retrieves health records accessible to the doctor */
export const getDoctorPatientHealthRecords = () => {
  return API.get("/doctor/health-records");
};

/* Builds the direct document view URL for a patient's health record */
export const getDoctorDocumentViewUrl = (id) => {
  return `http://localhost:5284/api/doctor/health-records/${id}/view`;
};