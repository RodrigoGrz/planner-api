import {
  confirmationErrorPage,
  confirmationExpiredPage,
  confirmationPromptPage,
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

describe('confirmationPromptPage', () => {
  const invite = {
    destination: 'Noruega',
    startsAt: new Date('2026-03-10T00:00:00.000Z'),
    endsAt: new Date('2026-03-14T00:00:00.000Z'),
    token: 'token-123',
  }

  it('should render a form that posts the token to confirm', () => {
    const html = confirmationPromptPage(invite)

    expect(html).toContain('<form method="post" action="/participants/confirm"')
    expect(html).toContain(
      '<input type="hidden" name="token" value="token-123"',
    )
    expect(html).toContain('Confirmar presença')
  })

  it('should escape the destination and the token in the prompt page', () => {
    const html = confirmationPromptPage({
      ...invite,
      destination: '<script>alert("xss")</script>',
      token: '"><script>',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
    expect(html).toContain('value="&quot;&gt;&lt;script&gt;"')
  })

  it('should show the trip dates using the UTC day', () => {
    const html = confirmationPromptPage(invite)

    expect(html).toContain('Noruega')
    expect(html).toContain('10 de março')
    expect(html).toContain('14 de março')
  })
})

describe('confirmationExpiredPage', () => {
  it('should render the expired page without interpolating anything', () => {
    const html = confirmationExpiredPage()

    expect(html).toContain('Este convite expirou')
    expect(html).toContain('peça um novo convite ao organizador')
  })
})
