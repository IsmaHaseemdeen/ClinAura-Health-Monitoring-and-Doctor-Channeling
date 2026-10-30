import API from "./api";

export const getPatientProfile = () => {
  return API.get("/patient/profile");
};

export const updatePatientProfile = (data) => {
  return API.put("/patient/profile", data);
};