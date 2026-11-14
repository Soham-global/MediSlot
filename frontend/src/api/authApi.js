import client from "./client";

export const authApi = {
  loginEmployee: (credentials) =>
    client.post("/api/auth/login", credentials).then((response) => response.data),

  register: (payload) =>
    client.post("/api/auth/register", payload).then((response) => response.data),

  getProfile: () => client.get("/api/auth/me").then((response) => response.data),

  updateProfile: (payload) =>
    client.put("/api/employees/me", payload).then((response) => response.data),

  loginAdmin: (credentials) =>
    client.post("/api/admin/auth/login", credentials).then((response) => response.data),

  getAdminProfile: () =>
    client.get("/api/admin/auth/me").then((response) => response.data),
};
