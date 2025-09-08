export async function getUserResenias(token: string) {
  const response = await fetch('http://localhost:3000/api/resenia/my-resenias', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw response;
  return await response.json();
}

export async function updateResenia(token: string, reseniaId: number, updateData: unknown) {
  const response = await fetch(`http://localhost:3000/api/resenia/${reseniaId}`, {
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
