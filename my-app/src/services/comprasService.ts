export async function getUserPurchases(token: string) {
  const response = await fetch('http://localhost:3000/api/venta/my-ventas', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw response;
  const data = await response.json();
  return data.data;
}
