import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

export type CompaniaRef = { id: number; nombre: string }
export type CategoriaRef = { id: number; nombre: string }

export type JuegoDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
  fechaLanzamiento: string
  edadPermitida: number
}

export type ServicioDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
}

export type ComplementoDetail = {
  id: number
  nombre: string
  detalle: string
  monto: number
  compania: CompaniaRef
  categorias: CategoriaRef[]
  juego: { id: number; nombre: string }
}

type ApiResponse<T> = { message: string; data: T }

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
}
