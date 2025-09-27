import { buildApiUrl } from './httpClient';

export type TopSeller = {
  id: number;
  tipo: 'juego' | 'servicio' | 'complemento';
  nombre: string;
  detalle: string;
  monto: number;
  imageUrl?: string | null;
  compania?: { id: number; nombre: string } | null;
  juegoRelacionado?: { id: number; nombre: string } | null;
  count: number;
}

export async function getTopSellers(params?: { tipo?: 'juego'|'servicio'|'complemento'|'todos'; limit?: number }) {
  const q = new URLSearchParams()
  if (params?.tipo) q.set('tipo', params.tipo)
  if (params?.limit) q.set('limit', String(params.limit))
  const url = buildApiUrl(`/search/top-sellers${q.toString() ? `?${q.toString()}` : ''}`)
  const res = await fetch(url)
  if (!res.ok) throw await res.json()
  const json = await res.json()
  return json.data as TopSeller[]
}
