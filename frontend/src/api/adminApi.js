import client from "./client";

export const adminApi = {
  getDashboard: () =>
    client.get("/api/admin/dashboard").then((response) => response.data),

  getHospital: () =>
    client.get("/api/admin/hospital").then((response) => response.data),

  updateHospital: (payload) =>
    client.put("/api/admin/hospital", payload).then((response) => response.data),

  getDepartments: () =>
    client.get("/api/admin/departments").then((response) => response.data),

  getDoctors: ({ name, departmentId, active } = {}) =>
    client
      .get("/api/admin/doctors", {
        params: {
          name: name || undefined,
          departmentId: departmentId || undefined,
          isActive: typeof active === "boolean" ? active : undefined,
        },
      })
      .then((response) => response.data),

  getDoctor: (id) =>
    client.get(`/api/admin/doctors/${id}`).then((response) => response.data),

  createDoctor: (payload) =>
    client.post("/api/admin/doctors", payload).then((response) => response.data),

  updateDoctor: (id, payload) =>
    client.put(`/api/admin/doctors/${id}`, payload).then((response) => response.data),

  setDoctorStatus: (id, active) =>
    client
      .put(`/api/admin/doctors/${id}/status`, { isActive: active })
      .then((response) => response.data),

  deleteDoctor: (id) =>
    client.delete(`/api/admin/doctors/${id}`).then((response) => response.data),

  replaceSchedule: (id, rules) =>
    client
      .put(`/api/admin/doctors/${id}/schedule`, { schedules: rules })
      .then((response) => response.data),

  getSlots: (id, date) =>
    client
      .get(`/api/admin/doctors/${id}/slots`, { params: date ? { date } : {} })
      .then((response) => response.data),

  blockSlots: (id, { startDate, endDate, startTime, endTime, reason }) =>
    client
      .post(`/api/admin/doctors/${id}/slots/block`, {
        fromDate: startDate,
        toDate: endDate,
        startTime: startTime || null,
        endTime: endTime || null,
        reason,
      })
      .then((response) => response.data),

  unblockSlot: (id) =>
    client.put(`/api/admin/slots/${id}/unblock`).then((response) => response.data),

  getAppointments: ({ doctorId, date, status, page = 0, size = 20 } = {}) =>
    client
      .get("/api/admin/appointments", {
        params: {
          doctorId: doctorId || undefined,
          date: date || undefined,
          status: status || undefined,
          page,
          size,
        },
      })
      .then((response) => response.data),

  getAppointment: (id) =>
    client.get(`/api/admin/appointments/${id}`).then((response) => response.data),

  confirmAppointment: (id) =>
    client
      .put(`/api/admin/appointments/${id}/confirm`)
      .then((response) => response.data),

  cancelAppointment: (id) =>
    client
      .put(`/api/admin/appointments/${id}/cancel`)
      .then((response) => response.data),

  completeAppointment: (id) =>
    client
      .put(`/api/admin/appointments/${id}/complete`)
      .then((response) => response.data),

  markNoShow: (id) =>
    client
      .put(`/api/admin/appointments/${id}/no-show`)
      .then((response) => response.data),
};
