import { buildApiUrl } from './httpClient';

export async function getUserProfile(token: string) {
  const response = await fetch(buildApiUrl('/usuario/profile'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw response;
  const data = await response.json();
  return data;
}

export async function updateUserProfile(token: string, updateData: unknown) {
  const response = await fetch(buildApiUrl(`/usuario`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}
