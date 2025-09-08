import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface Company {
  id: number;
  nombre: string;
  detalle: string;
}

export interface CompanyListResponse {
  message: string;
  data: Company[];
}

const api = axios.create({ baseURL: API_BASE_URL });

export const companyService = {
  async getAll(): Promise<Company[]> {
    const res = await api.get<CompanyListResponse>('/compania');
    return res.data.data;
  },
};
