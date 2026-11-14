import client from "./client";

export const appointmentsApi = {
  bookAppointment: ({ slotId, reason }) =>
    client
      .post("/api/appointments", { slotId, reason })
      .then((response) => response.data),

  getMyAppointments: (status) =>
    client
      .get("/api/appointments/my", { params: status ? { status } : {} })
      .then((response) => response.data),

  getAppointment: (id) =>
    client.get(`/api/appointments/${id}`).then((response) => response.data),

  cancelAppointment: (id) =>
    client.put(`/api/appointments/${id}/cancel`).then((response) => response.data),
};
