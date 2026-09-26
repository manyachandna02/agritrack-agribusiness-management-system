// client/src/services/api.js
//
// Single centralized Axios instance. Every request/service file in the
// app imports THIS, instead of creating its own axios config, so the
// base URL, auth header, and error handling stay consistent in one place.

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT automatically, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agritrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into a consistent shape ({ status, message }) and
// handle the one cross-cutting case every screen cares about: an
// expired/invalid token should bounce the user back to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401) {
      localStorage.removeItem("agritrack_token");
      localStorage.removeItem("agritrack_user");
      // Avoid a redirect loop if the 401 came from the login call itself.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject({ status, message, original: error });
  }
);

export default api;
