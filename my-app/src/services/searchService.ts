import { apiClient } from './httpClient';

export type SearchTipo = 'juego' | 'servicio' | 'complemento' | 'todos';

export type SearchParams = {
	q?: string;
	tipo?: SearchTipo;
	companiaId?: number;
	categoriaId?: number;
	priceMin?: number;
	priceMax?: number;
	edadMax?: number; // solo para juegos
	page?: number;
	limit?: number;
};

export type SearchItem = {
	id: number;
	tipo: 'juego' | 'servicio' | 'complemento';
	nombre: string;
	detalle: string;
	monto: number;
	compania: { id: number; nombre: string } | null;
	categorias?: { id: number; nombre: string }[];
	imageUrl?: string | null;
	fechaLanzamiento?: string;
	edadPermitida?: number;
	juegoRelacionado?: { id: number; nombre: string } | null;
};

export type SearchResponse = {
	message: string;
	page: number;
	limit: number;
	count: number;
	data: SearchItem[];
};

const api = apiClient;

export const searchService = {
	async search(params: SearchParams): Promise<SearchResponse> {
		const res = await api.get<SearchResponse>('/search', { params });
		return res.data;
	},
};

