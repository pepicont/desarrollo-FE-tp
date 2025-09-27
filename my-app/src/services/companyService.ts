import { apiClient, buildApiUrl } from './httpClient';

export interface Company {
  id: number;
  nombre: string;
  detalle: string;
}

export interface CompanyListResponse {
  message: string;
  data: Company[];
}

const api = apiClient;

// Servicio para obtener todas las compañías (solo admin)
export async function getAllCompaniesAdmin(token: string): Promise<Company[]> {
  try {
  const response = await fetch(buildApiUrl('/compania'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      const error: Error & { status?: number } = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();
    return json.data as Company[];
  } catch (error) {
    console.error('Error en getAllCompaniesAdmin:', error);
    throw error;
  }
}

// Servicio para eliminar una compañía (solo admin)
export async function deleteCompanyAsAdmin(token: string, companiaId: number) {
  try {
  const response = await fetch(buildApiUrl(`/compania/${companiaId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      const error: Error & { status?: number } = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error('Error en deleteCompanyAsAdmin:', error);
    throw error;
  }
}

// Servicio para crear una nueva compañía (solo admin)
export async function createCompany(token: string, companyData: { nombre: string; detalle: string }): Promise<Company> {
  try {
  const response = await fetch(buildApiUrl('/compania'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      const error: Error & { status?: number } = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();
    return json.data as Company;
  } catch (error) {
    console.error('Error en createCompany:', error);
    throw error;
  }
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    const res = await api.get<CompanyListResponse>('/compania');
    return res.data.data;
  },
};
