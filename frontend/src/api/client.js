import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const TOKEN_KEY = 'token';
export const ROLE_KEY = 'role';
export const USER_KEY = 'user';

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const role = localStorage.getItem(ROLE_KEY);
      const fallbackPath = window.location.pathname.startsWith('/admin')
        ? '/admin/login'
        : '/login';
      const loginPath =
        role === 'HOSPITAL_ADMIN'
          ? '/admin/login'
          : role === 'EMPLOYEE'
            ? '/login'
            : fallbackPath;

      clearStoredSession();

      if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
