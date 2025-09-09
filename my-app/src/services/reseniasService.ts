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
