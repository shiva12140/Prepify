import axios from "axios";

const API = axios.create({
  baseURL: "/api/v1",
});

// Attach token automatically for every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
