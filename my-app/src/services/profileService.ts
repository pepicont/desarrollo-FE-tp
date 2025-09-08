export async function getUserProfile(token: string) {
  const response = await fetch('http://localhost:3000/api/usuario/profile', {
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

export async function updateUserProfile(token: string, userId: number, updateData: unknown) {
  const response = await fetch(`http://localhost:3000/api/usuario/${userId}`, {
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
