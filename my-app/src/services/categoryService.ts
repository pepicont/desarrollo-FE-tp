import { apiClient, buildApiUrl } from './httpClient';

export interface Category {
  id: number;
  nombre: string;
  detalle: string;
}

export interface CategoryListResponse {
  message: string;
  data: Category[];
}

const api = apiClient;

// Servicio para obtener todas las categorías (solo admin)
export async function getAllCategoriesAdmin(token: string): Promise<Category[]> {
  try {
  const response = await fetch(buildApiUrl('/categoria'), {
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
    return json.data as Category[];
  } catch (error) {
    console.error('Error en getAllCategoriesAdmin:', error);
    throw error;
  }
}

// Servicio para eliminar una categoría (solo admin)
export async function deleteCategoryAsAdmin(token: string, categoriaId: number) {
  try {
  const response = await fetch(buildApiUrl(`/categoria/${categoriaId}`), {
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
    console.error('Error en deleteCategoryAsAdmin:', error);
    throw error;
  }
}

// Servicio para crear una nueva categoría (solo admin)
export async function createCategory(token: string, categoryData: { nombre: string; detalle: string }): Promise<Category> {
  try {
  const response = await fetch(buildApiUrl('/categoria'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      const error: Error & { status?: number } = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();
    return json.data as Category;
  } catch (error) {
    console.error('Error en createCategory:', error);
    throw error;
  }
}

// Servicio para actualizar una categoría existente (solo admin)
export async function updateCategory(token: string, categoriaId: number, categoryData: { nombre: string; detalle: string }): Promise<Category> {
  try {
    const response = await fetch(buildApiUrl(`/categoria/${categoriaId}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      const error: Error & { status?: number } = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();
    return json.data as Category;
  } catch (error) {
    console.error('Error en updateCategory:', error);
    throw error;
  }
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<CategoryListResponse>('/categoria');
    return res.data.data;
  },
};