import axios from "axios";

/* Creates a shared Axios instance used for all backend API requests */
const API = axios.create({
  /* Defines the base URL for all API endpoints */
  baseURL: "http://localhost:5284/api",
});

/* Interceptor that runs before every request is sent to the backend */
API.interceptors.request.use((req) => {
  /* Retrieves the stored JWT token from local storage */
  const token = localStorage.getItem("token");

  /* Attaches the token to the Authorization header if it exists */
  if (token && token.trim() !== "") {
    req.headers.Authorization = `Bearer ${token}`;
  }

  /* Returns the modified request object */
  return req;
});

/* Exports the configured API instance to be used across services */
export default API;