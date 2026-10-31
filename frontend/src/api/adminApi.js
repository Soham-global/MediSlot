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
