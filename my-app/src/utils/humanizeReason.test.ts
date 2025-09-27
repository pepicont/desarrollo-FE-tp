import { describe, it, expect } from 'vitest'

// Como humanizeReason está definida dentro del componente, la duplico aquí para testearla
function humanizeReason(key: string) {
  const map: Record<string, string> = {
    'harassment': 'acoso',
    'harassment/threatening': 'acoso o amenazas',
    'hate': 'discurso de odio',
    'hate/threatening': 'odio o amenazas',
    'self-harm': 'autolesiones',
    'sexual': 'contenido sexual',
    'sexual/minors': 'contenido sexual relacionado con menores',
    'violence': 'violencia',
    'violence/graphic': 'violencia gráfica',
    'self-harm/intent': 'intención de autolesión',
    'self-harm/instructions': 'instrucciones de autolesión',
  }
  return map[key] || key
}

describe('humanizeReason - Traducción de códigos de moderación', () => {
  it('debe traducir códigos de acoso correctamente', () => {
    expect(humanizeReason('harassment')).toBe('acoso')
    expect(humanizeReason('harassment/threatening')).toBe('acoso o amenazas')
  })

  it('debe traducir códigos de odio correctamente', () => {
    expect(humanizeReason('hate')).toBe('discurso de odio')
    expect(humanizeReason('hate/threatening')).toBe('odio o amenazas')
  })

  it('debe traducir códigos de violencia correctamente', () => {
    expect(humanizeReason('violence')).toBe('violencia')
    expect(humanizeReason('violence/graphic')).toBe('violencia gráfica')
  })

  it('debe traducir códigos de contenido sexual correctamente', () => {
    expect(humanizeReason('sexual')).toBe('contenido sexual')
    expect(humanizeReason('sexual/minors')).toBe('contenido sexual relacionado con menores')
  })

  it('debe traducir códigos de autolesiones correctamente', () => {
    expect(humanizeReason('self-harm')).toBe('autolesiones')
    expect(humanizeReason('self-harm/intent')).toBe('intención de autolesión')
    expect(humanizeReason('self-harm/instructions')).toBe('instrucciones de autolesión')
  })

  it('debe devolver el código original para términos no reconocidos', () => {
    expect(humanizeReason('unknown-category')).toBe('unknown-category')
    expect(humanizeReason('spam')).toBe('spam')
    expect(humanizeReason('copyright')).toBe('copyright')
  })

  it('debe manejar strings vacíos y casos edge', () => {
    expect(humanizeReason('')).toBe('')
    expect(humanizeReason('HATE')).toBe('HATE') // case-sensitive
    expect(humanizeReason('violence/')).toBe('violence/')
  })

  it('debe ser case-sensitive', () => {
    expect(humanizeReason('Violence')).toBe('Violence')
    expect(humanizeReason('VIOLENCE')).toBe('VIOLENCE')
    expect(humanizeReason('violence')).toBe('violencia')
  })
})