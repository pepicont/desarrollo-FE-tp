import { buildApiUrl } from './httpClient';

type ProductoVenta = {
  id: number;
  nombre: string;
  detalle?: string;
  monto?: number;
  fotos?: Array<{ id: number; url: string; esPrincipal?: boolean }>;
};

export type AdminCompra = {
  id: number;
  fecha: string;
  idVenta?: number;
  codActivacion?: string;
  usuario: {
    id: number;
    nombre?: string;
    nombreUsuario: string;
    mail?: string;
  };
  juego?: ProductoVenta | null;
  servicio?: ProductoVenta | null;
  complemento?: ProductoVenta | null;
};

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

export async function getAllPurchasesAdmin(token: string): Promise<AdminCompra[]> {
  const response = await fetch(buildApiUrl('/venta'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw response;
  const json = await response.json();
  return json.data as AdminCompra[];
}
