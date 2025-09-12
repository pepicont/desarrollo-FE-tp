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

// Mercado Pago
export async function mpStartPreference(tipo: TipoProducto, id: number) {
  const token = authService.getToken()
  if (!token) throw new Error('No autenticado')
  const res = await API.post('/mp/start', { tipo, id }, { headers: { Authorization: `Bearer ${token}` } })
  return res.data.data as { id: string; init_point: string }
}

export async function mpConfirm(paymentId: string) {
  const token = authService.getToken()
  if (!token) throw new Error('No autenticado')
  const res = await API.get('/mp/confirm', { params: { payment_id: paymentId }, headers: { Authorization: `Bearer ${token}` } })
  return res.data.data as { status: 'paid'; venta: VentaMinimal }
}

// Nuevo: obtener resultado de pago por payment_id (no requiere auth)
export async function mpResult(paymentId: string) {
  const res = await API.get('/mp/result', { params: { payment_id: paymentId } })
  return res.data.data as { status: 'paid' | 'pending'; venta?: VentaMinimal }
}

// Nuevo: obtener una venta por id (público en este backend)
export async function getVenta(ventaId: number) {
  const res = await axios.get(`http://localhost:3000/api/venta/${ventaId}`)
  return res.data.data as VentaMinimal
}
