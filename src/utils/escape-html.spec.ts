import { escapeHtml } from './escape-html'

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Bordeaux & Paris')).toBe('Bordeaux &amp; Paris')
  })

  it('should escape angle brackets', () => {
    expect(escapeHtml('<b>')).toBe('&lt;b&gt;')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('"x"')).toBe('&quot;x&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("Cote d'Azur")).toBe('Cote d&#39;Azur')
  })

  it('should not double escape entities', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('should keep plain text unchanged', () => {
    expect(escapeHtml('Noruega')).toBe('Noruega')
  })
})
