import client from './client';

export async function employeeLogin({ employeeCode, password }) {
  const { data } = await client.post('/api/auth/login', {
    employeeCode,
    password,
  });

  return data;
}

export async function adminLogin({ email, password }) {
  const { data } = await client.post('/api/admin/auth/login', {
    email,
    password,
  });

  return data;
}

export async function employeeMe() {
  const { data } = await client.get('/api/auth/me');
  return data;
}

export async function adminMe() {
  const { data } = await client.get('/api/admin/auth/me');
  return data;
}
