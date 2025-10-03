import { buildApiUrl } from './httpClient'

// Interface para los datos del usuario
export interface Usuario {
  id: number
  nombreUsuario: string
  mail: string
  fechaCreacion: string
  nombre: string
  fechaNacimiento: string
  contrasenia?: string,
  tipoUsuario: 'admin' | 'cliente';
  urlFoto?: string;  // Solo para updates, nunca se recibe del backend
}

// Servicio para obtener todos los usuarios (solo admin)
export async function getAllUsuarios(token: string): Promise<Usuario[]> {
  const response = await fetch(buildApiUrl('/usuario'), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw { status: response.status, ...error }
  }

  const data = await response.json()
  return data.data
}

// Servicio para eliminar un usuario (solo admin)
export async function deleteUsuario(token: string, usuarioId: number): Promise<void> {
  const response = await fetch(buildApiUrl(`/usuario/${usuarioId}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: `Error ${response.status}: ${response.statusText}` }
    }
    throw { status: response.status, ...errorData }
  }
}

// Servicio para actualizar un usuario (solo admin)
export async function updateUsuario(token: string, usuarioId: number, usuarioData: Partial<Usuario>): Promise<Usuario> {
  const response = await fetch(buildApiUrl(`/usuario/${usuarioId}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuarioData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw { status: response.status, ...error }
  }

  const data = await response.json()
  return data.data
}