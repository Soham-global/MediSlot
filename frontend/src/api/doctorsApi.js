import client from "./client";

export const doctorsApi = {
  getDoctors: (params = {}) =>
    client.get("/api/doctors", { params }).then((response) => response.data),

  getDoctor: (id) =>
    client.get(`/api/doctors/${id}`).then((response) => response.data),

  getDepartments: () =>
    client.get("/api/departments").then((response) => response.data),

  getHospitals: () =>
    client.get("/api/hospitals").then((response) => response.data),

  getSlots: (doctorId, date) =>
    client
      .get(`/api/doctors/${doctorId}/slots`, { params: { date } })
      .then((response) => response.data),
};
