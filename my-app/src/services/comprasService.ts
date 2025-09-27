import { buildApiUrl } from './httpClient';

export async function getUserPurchases(token: string) {
  const response = await fetch(buildApiUrl('/venta/my-ventas'), {
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
