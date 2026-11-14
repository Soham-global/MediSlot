import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authRequestPaths = ["/api/auth/login", "/api/auth/register", "/api/admin/auth/login"];
const authPagePaths = ["/login", "/signup", "/admin/login"];

function isAuthRequest(url = "") {
  return authRequestPaths.some((path) => url.includes(path));
}

function isAuthPage() {
  return authPagePaths.some((path) => window.location.pathname === path);
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url) && !isAuthPage()) {
      const role = localStorage.getItem("role");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.location.assign(role === "HOSPITAL_ADMIN" ? "/admin/login" : "/login");
    }
    return Promise.reject(error);
  },
);

export function getApiMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return data?.message || data?.error || error?.message || fallback;
}

export default client;
