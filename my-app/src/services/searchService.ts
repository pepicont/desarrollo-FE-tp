import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

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

const api = axios.create({ baseURL: API_BASE_URL });

export const searchService = {
	async search(params: SearchParams): Promise<SearchResponse> {
		const res = await api.get<SearchResponse>('/search', { params });
		return res.data;
	},
};

