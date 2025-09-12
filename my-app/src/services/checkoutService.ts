import axios from 'axios'
import { authService } from './authService'

const API = axios.create({ baseURL: 'http://localhost:3000/api/checkout' })

export type TipoProducto = 'juego' | 'servicio' | 'complemento'

export type VentaMinimal = {
  id: number
  codActivacion: string
  fecha: string
  juego?: { id: number }
  servicio?: { id: number }
  complemento?: { id: number }
}

export async function startCheckout(tipo: TipoProducto, id: number) {
  const token = authService.getToken()
  if (!token) throw new Error('No autenticado')
  const res = await API.post('/start', { tipo, id }, { headers: { Authorization: `Bearer ${token}` } })
  return res.data.data as { sessionId: string; status: 'pending' }
}

export async function simulateSuccess(sessionId: string) {
  const token = authService.getToken()
  if (!token) throw new Error('No autenticado')
  const res = await API.post('/simulate-success', { sessionId }, { headers: { Authorization: `Bearer ${token}` } })
  return res.data.data as { status: 'paid'; venta: VentaMinimal }
}

export async function getStatus(sessionId: string) {
  const token = authService.getToken()
  if (!token) throw new Error('No autenticado')
  const res = await API.get('/status', { params: { sessionId }, headers: { Authorization: `Bearer ${token}` } })
  return res.data.data as { status: 'pending' | 'paid' | 'cancelled'; ventaId?: number }
}
