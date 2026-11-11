import client from './client';

// Remove empty filters so we never send ?date=&status= to the server
function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
}

// Returns { content, page, size, totalElements, totalPages }. page is 0-based.
export async function fetchAdminAppointments(params = {}) {
  const { data } = await client.get('/api/admin/appointments', {
    params: clean(params),
  });
  return data;
}

// action: 'confirm' | 'complete' | 'no-show' | 'cancel'
export async function updateAdminAppointment(id, action) {
  const { data } = await client.put(
    `/api/admin/appointments/${id}/${action}`
  );
  return data;
}

// Used for the doctor dropdown in filters
export async function fetchAdminDoctors(params = {}) {
  const { data } = await client.get('/api/admin/doctors', {
    params: clean(params),
  });
  return data;
}

// { hospitalName, todayAppointments, pendingAppointments,
//   completedToday, totalDoctors, doctorsAvailableToday }
export async function fetchDashboard() {
  const { data } = await client.get('/api/admin/dashboard');
  return data;
}

export async function fetchAdminDepartments() {
  const { data } = await client.get('/api/admin/departments');
  return data;
}

// body: { name, departmentId, specialization, qualification, experienceYears }
export async function createAdminDoctor(body) {
  const { data } = await client.post('/api/admin/doctors', body);
  return data;
}

export async function updateAdminDoctor(id, body) {
  const { data } = await client.put(`/api/admin/doctors/${id}`, body);
  return data;
}

// Returns { id, isActive, upcomingAppointments }
export async function setAdminDoctorActive(id, isActive) {
  const { data } = await client.put(`/api/admin/doctors/${id}/status`, {
    isActive,
  });
  return data;
}

// Fails with 409 if the doctor has ever had an appointment
export async function deleteAdminDoctor(id) {
  const { data } = await client.delete(`/api/admin/doctors/${id}`);
  return data;
}
