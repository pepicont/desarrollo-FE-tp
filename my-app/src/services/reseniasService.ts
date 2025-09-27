import { buildApiUrl } from './httpClient';

export async function getUserResenias(token: string) {
  const response = await fetch(buildApiUrl('/resenia/my-resenias'), {
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
  const response = await fetch(buildApiUrl(`/resenia/${reseniaId}`), {
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
  usuario: { id: number; nombreUsuario: string; urlFoto?: string };
}

export async function getReviewsByProduct(
  tipo: 'juego' | 'servicio' | 'complemento',
  id: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: ProductReview[]; page: number; totalPages: number; total: number }> {
  const response = await fetch(buildApiUrl(`/resenia/by-product/${tipo}/${id}?page=${page}&limit=${limit}`));
  if (!response.ok) throw await response.json();
  const json = await response.json();
  return {
    data: json.data as ProductReview[],
    page: json.page,
    totalPages: json.totalPages,
    total: json.total
  };
}

export async function checkUserReviewForPurchase(token: string, ventaId: number) {
  const response = await fetch(buildApiUrl(`/resenia/check-purchase/${ventaId}`), {
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
  const response = await fetch(buildApiUrl('/resenia'), {
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
  const response = await fetch(buildApiUrl(`/resenia/${reseniaId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}

export async function deleteReseniaAsAdmin(token: string, reseniaId: number) {
  const response = await fetch(buildApiUrl(`/resenia/admin/${reseniaId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw await response.json();
  return await response.json();
}

export type AdminResenia = {
  id: number;
  detalle: string;
  puntaje: number;
  fecha: string;
  usuario: {
    id: number;
    nombreUsuario: string;
    nombre?: string;
  };
  venta: {
    id: number;
    fecha: string;
    juego?: {
      id: number;
      nombre: string;
      imagen?: string;
    };
    servicio?: {
      id: number;
      nombre: string;
      imagen?: string;
    };
    complemento?: {
      id: number;
      nombre: string;
      imagen?: string;
    };
  };
}

export async function getAllResenasAdmin(token: string): Promise<AdminResenia[]> {
  const response = await fetch(buildApiUrl('/resenia/admin/all'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw await response.json();
  const json = await response.json();
  return json.data as AdminResenia[];
}
