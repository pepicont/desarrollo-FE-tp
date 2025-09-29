import { apiClient } from './httpClient'

export type CompaniaRef = { id: number; nombre: string }
export type CategoriaRef = { id: number; nombre: string }

export type Foto = {
  id: number
  url: string
  esPrincipal: boolean
}

export type JuegoDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
  fechaLanzamiento: string
  edadPermitida: number
  fotos?: Foto[]
  ventasCount?: number
}

export type ServicioDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
  fotos?: Foto[]
  ventasCount?: number
}

export type ComplementoDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
  juego: { id: number; nombre: string }
  fotos?: Foto[]
  ventasCount?: number
}

type ApiResponse<T> = { message: string; data: T }

// Types for creating products
export type CreateJuegoData = {
  nombre: string
  detalle: string
  monto: number
  categorias: number[]
  compania: number
  fechaLanzamiento: string
  edadPermitida: number
}

export type CreateServicioData = {
  nombre: string
  detalle: string
  monto: number
  categorias: number[]
  compania: number
}

export type CreateComplementoData = {
  nombre: string
  detalle: string
  monto: number
  categorias: number[]
  compania: number
  juego: number
}

const api = apiClient

export const productService = {
  async deleteJuego(id: number, token: string): Promise<void> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    await api.delete(`/juego/${id}`, config);
  },

    async deleteServicio(id: number, token: string): Promise<void> {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      await api.delete(`/servicio/${id}`, config);
    },
  async createJuegoConFotos(formData: FormData, token: string): Promise<JuegoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
        // No poner Content-Type, axios lo setea automáticamente para FormData
      }
    }
    const res = await api.post<ApiResponse<JuegoDetail>>('/juego', formData, config)
    return res.data.data
  },

  async updateJuegoConFotos(id: number, formData: FormData, token: string): Promise<JuegoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    const res = await api.put<ApiResponse<JuegoDetail>>(`/juego/${id}`, formData, config)
    return res.data.data
  },

    async createServicioConFotos(formData: FormData, token: string): Promise<ServicioDetail> {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
          // No poner Content-Type, axios lo setea automáticamente para FormData
        }
      }
      const res = await api.post<ApiResponse<ServicioDetail>>('/servicio', formData, config)
      return res.data.data
    },

    async updateServicioConFotos(id: number, formData: FormData, token: string): Promise<ServicioDetail> {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      const res = await api.put<ApiResponse<ServicioDetail>>(`/servicio/${id}`, formData, config)
      return res.data.data
    },
  async getJuego(id: number): Promise<JuegoDetail> {
    const res = await api.get<ApiResponse<JuegoDetail>>(`/juego/${id}`)
    return res.data.data
  },
  async getServicio(id: number): Promise<ServicioDetail> {
    const res = await api.get<ApiResponse<ServicioDetail>>(`/servicio/${id}`)
    return res.data.data
  },
  async getComplemento(id: number): Promise<ComplementoDetail> {
    const res = await api.get<ApiResponse<ComplementoDetail>>(`/complemento/${id}`)
    return res.data.data
  },
  async getFotos(tipo: 'juego'|'complemento'|'servicio', id: number): Promise<Foto[]> {
    const res = await api.get<ApiResponse<Foto[]>>(`/foto-producto/${tipo}/${id}`)
    return res.data.data
  },

  async createComplemento(data: CreateComplementoData, token: string): Promise<ComplementoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.post<ApiResponse<ComplementoDetail>>('/complemento', data, config)
    return res.data.data
  },

  // Helper method to get all juegos for complemento selection
  async getAllJuegos(): Promise<JuegoDetail[]> {
    const res = await api.get<ApiResponse<JuegoDetail[]>>('/juego')
    return res.data.data
  },

  async updateComplemento(id: number, data: CreateComplementoData, token: string): Promise<ComplementoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.put<ApiResponse<ComplementoDetail>>(`/complemento/${id}`, data, config)
    return res.data.data
  },
}
