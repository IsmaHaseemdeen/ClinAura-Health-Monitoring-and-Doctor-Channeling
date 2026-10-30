import API from "./api";

/* Retrieve the list of doctors that can be booked by the patient */
export const getDoctorsForBooking = () => {
  return API.get("/appointments/doctors");
};

/* Retrieve available slots for a doctor, date, and consultation mode */
export const getAvailableSlots = (doctorProfileId, appointmentDate, mode) => {
  return API.get(`/appointments/doctors/${doctorProfileId}/slots`, {
    params: {
      appointmentDate,
      mode
    }
  });
};

/* Create a new appointment booking request */
export const createAppointment = (data) => {
  return API.post("/appointments", data);
};

/* Retrieve the logged-in patient's own appointments */
export const getMyAppointments = () => {
  return API.get("/appointments/my");
};

/* Cancel a patient appointment by appointment ID */
export const cancelAppointment = (appointmentId) => {
  return API.put(`/appointments/${appointmentId}/cancel`);
};

/* Retrieve lightweight pending appointments for the logged-in doctor */
export const getDoctorPendingAppointments = () => {
  return API.get("/appointments/doctor/pending");
};

/* Retrieve all appointments belonging to the logged-in doctor */
export const getDoctorAppointments = () => {
  return API.get("/appointments/doctor/my");
};

/* Allow the doctor to complete an appointment and assign final payment details */
export const completeAppointment = (appointmentId, data) => {
  return API.put(`/appointments/${appointmentId}/status`, data);
};

/* Allow the patient to complete payment for an appointment */
export const payForAppointment = (appointmentId, data) => {
  return API.put(`/appointments/${appointmentId}/pay`, data);
};

/* Retrieve upcoming appointments for the admin dashboard */
export const getUpcomingAppointmentsForAdmin = () => {
  return API.get("/appointments/admin/upcoming");
};