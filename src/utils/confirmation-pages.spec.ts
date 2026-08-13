import {
  confirmationErrorPage,
  confirmationSuccessPage,
} from './confirmation-pages'

describe('confirmationSuccessPage', () => {
  it('should render the destination', () => {
    const html = confirmationSuccessPage({ destination: 'Noruega' })

    expect(html).toContain('Presença confirmada!')
    expect(html).toContain('Noruega')
  })

  it('should escape markup coming from the destination', () => {
    const html = confirmationSuccessPage({
      destination: '<script>alert("xss")</script>',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('should escape ampersands before the other entities', () => {
    const html = confirmationSuccessPage({ destination: 'Bordeaux & Paris' })

    expect(html).toContain('Bordeaux &amp; Paris')
  })

  it('should escape single quotes', () => {
    const html = confirmationSuccessPage({ destination: "Cote d'Azur" })

    expect(html).toContain('Cote d&#39;Azur')
  })
})

describe('confirmationErrorPage', () => {
  it('should render a static message without interpolating anything', () => {
    const html = confirmationErrorPage()

    expect(html).toContain('Não foi possível confirmar')
    expect(html).toContain('inválido ou já foi utilizado')
  })
})
