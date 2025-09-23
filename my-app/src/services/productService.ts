import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

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

const api = axios.create({ baseURL: API_BASE_URL })

export const productService = {
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
  async addFoto(tipo: 'juego'|'complemento'|'servicio', id: number, body: { url: string; esPrincipal?: boolean }): Promise<Foto> {
    const res = await api.post<ApiResponse<Foto>>(`/foto-producto/${tipo}/${id}`, body)
    return res.data.data
  },
  async setFotoPrincipal(tipo: 'juego'|'complemento'|'servicio', id: number, fotoId: number): Promise<void> {
    await api.put(`/foto-producto/${tipo}/${id}/${fotoId}/principal`)
  },
  async removeFoto(tipo: 'juego'|'complemento'|'servicio', id: number, fotoId: number): Promise<void> {
    await api.delete(`/foto-producto/${tipo}/${id}/${fotoId}`)
  },

  // Create methods
  async createJuego(data: CreateJuegoData, token: string): Promise<JuegoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.post<ApiResponse<JuegoDetail>>('/juego', data, config)
    return res.data.data
  },

  async createServicio(data: CreateServicioData, token: string): Promise<ServicioDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.post<ApiResponse<ServicioDetail>>('/servicio', data, config)
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

  // Update methods
  async updateJuego(id: number, data: CreateJuegoData, token: string): Promise<JuegoDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.put<ApiResponse<JuegoDetail>>(`/juego/${id}`, data, config)
    return res.data.data
  },

  async updateServicio(id: number, data: CreateServicioData, token: string): Promise<ServicioDetail> {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    const res = await api.put<ApiResponse<ServicioDetail>>(`/servicio/${id}`, data, config)
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
