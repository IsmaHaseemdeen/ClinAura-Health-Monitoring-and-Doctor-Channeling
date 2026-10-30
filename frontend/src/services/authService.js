import API from "./api";

/* Sends a registration request to the backend with new user details */
export const register = (data) => API.post("/Auth/register", data);

/* Sends a login request to the backend with user credentials */
export const login = (data) => API.post("/Auth/login", data);