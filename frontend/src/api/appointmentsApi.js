import client from './client';

export async function bookAppointment({ slotId, reason }) {
  const { data } = await client.post('/api/appointments', {
    slotId,
    reason: reason?.trim() || null,
  });
  return data;
}
