import client from './client';

// Remove empty filters so we never send ?hospitalId=&name= to the server
function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
}

export async function fetchDoctors(params = {}) {
  const { data } = await client.get('/api/doctors', {
    params: clean(params),
  });
  return data;
}

export async function fetchHospitals() {
  const { data } = await client.get('/api/hospitals');
  return data;
}

export async function fetchDepartments() {
  const { data } = await client.get('/api/departments');
  return data;
}
