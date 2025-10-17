import { describe, it, expect } from 'vitest'
import { buildApiUrl, API_BASE_URL } from '../../src/services/httpClient'

describe('buildApiUrl - Construcción de URLs de API', () => {
  it('debe construir URL relativa agregando slash inicial', () => {
    const result = buildApiUrl('products')
    expect(result).toBe(`${API_BASE_URL}/products`)
  })

  it('debe mantener URL relativa que ya tiene slash inicial', () => {
    const result = buildApiUrl('/users')
    expect(result).toBe(`${API_BASE_URL}/users`)
  })

  it('debe devolver URL absoluta HTTP sin modificar', () => {
    const absoluteUrl = 'http://external-api.com/data'
    const result = buildApiUrl(absoluteUrl)
    expect(result).toBe(absoluteUrl)
  })

  it('debe devolver URL absoluta HTTPS sin modificar', () => {
    const absoluteUrl = 'https://secure-api.com/secure-data'
    const result = buildApiUrl(absoluteUrl)
    expect(result).toBe(absoluteUrl)
  })

  it('debe manejar rutas con parámetros', () => {
    const result = buildApiUrl('products/123/reviews')
    expect(result).toBe(`${API_BASE_URL}/products/123/reviews`)
  })

  it('debe manejar rutas con query parameters', () => {
    const result = buildApiUrl('/search?q=videojuegos&category=accion')
    expect(result).toBe(`${API_BASE_URL}/search?q=videojuegos&category=accion`)
  })

  it('debe ser case-insensitive para protocolos HTTP/HTTPS', () => {
    const httpResult = buildApiUrl('HTTP://example.com/api')
    const httpsResult = buildApiUrl('HTTPS://example.com/api')
    
    expect(httpResult).toBe('HTTP://example.com/api')
    expect(httpsResult).toBe('HTTPS://example.com/api')
  })

  it('debe manejar strings vacíos agregando slash', () => {
    const result = buildApiUrl('')
    expect(result).toBe(`${API_BASE_URL}/`)
  })

})
