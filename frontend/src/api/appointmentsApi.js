import client from './client';

export async function bookAppointment({ slotId, reason }) {
  const { data } = await client.post('/api/appointments', {
    slotId,
    reason: reason?.trim() || null,
  });
  return data;
}

// status must be 'upcoming' or 'past' (anything else gives a 400 error)
export async function fetchMyAppointments(status = 'upcoming') {
  const { data } = await client.get('/api/appointments/my', {
    params: { status },
  });
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await client.put(`/api/appointments/${id}/cancel`);
  return data;
}
