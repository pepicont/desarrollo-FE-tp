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

export type ProductReview = {
  id: number;
  detalle: string;
  puntaje: number;
  fecha: string;
  usuario: { id: number; nombreUsuario: string };
}

export async function getReviewsByProduct(tipo: 'juego' | 'servicio' | 'complemento', id: number): Promise<ProductReview[]> {
  const response = await fetch(`http://localhost:3000/api/resenia/by-product/${tipo}/${id}`);
  if (!response.ok) throw await response.json();
  const json = await response.json();
  return json.data as ProductReview[];
}

export async function checkUserReviewForPurchase(token: string, ventaId: number) {
  const response = await fetch(`http://localhost:3000/api/resenia/check-purchase/${ventaId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw response;
  return await response.json();
}

export async function createResenia(token: string, reseniaData: {
  venta: number,
  detalle: string,
  puntaje: number,
  fecha: string
}) {
  const response = await fetch('http://localhost:3000/api/resenia', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reseniaData),
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}

export async function deleteResenia(token: string, reseniaId: number) {
  const response = await fetch(`http://localhost:3000/api/resenia/${reseniaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}
