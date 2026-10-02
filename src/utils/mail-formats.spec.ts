import { env } from '@/env'
import { participantInviteFormat } from './mail-formats'

describe('participantInviteFormat', () => {
  const trip = {
    destination: 'Noruega',
    startsAt: new Date('2026-03-10T12:00:00.000Z'),
    endsAt: new Date('2026-03-14T12:00:00.000Z'),
  }

  it('should build a confirmation link carrying the token', () => {
    const { html } = participantInviteFormat({
      ...trip,
      confirmationToken: 'token-123',
    })

    const expectedLink = new URL('/participants/confirm', env.API_BASE_URL)
    expectedLink.searchParams.set('token', 'token-123')

    expect(html).toContain(`href="${expectedLink.toString()}"`)
  })

  it('should encode tokens with characters that are unsafe in a query string', () => {
    const { html } = participantInviteFormat({
      ...trip,
      confirmationToken: 'a b&c',
    })

    expect(html).toContain('token=a+b%26c')
  })

  it('should build a subject with the destination and the start date', () => {
    const { subject } = participantInviteFormat({
      ...trip,
      confirmationToken: 'token-123',
    })

    expect(subject).toBe(
      'Confirme sua presença na viagem para Noruega em 10 de março',
    )
  })

  it('should escape html in the destination', () => {
    const { html } = participantInviteFormat({
      ...trip,
      destination: '<script>alert("xss")</script>',
      confirmationToken: 'token-123',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('should not render links injected through the destination', () => {
    const { html } = participantInviteFormat({
      ...trip,
      destination: '<a href="http://phish">Clique aqui</a>',
      confirmationToken: 'token-123',
    })

    expect(html).not.toContain('href="http://phish"')
  })

  it('should strip line breaks from the subject', () => {
    const { subject } = participantInviteFormat({
      ...trip,
      destination: 'Noruega\r\nBcc: x@y.com',
      confirmationToken: 'token-123',
    })

    expect(subject).not.toMatch(/[\r\n]/)
    expect(subject).toBe(
      'Confirme sua presença na viagem para Noruega Bcc: x@y.com em 10 de março',
    )
  })

  it('should not leave extra spaces where line breaks were stripped', () => {
    const { subject } = participantInviteFormat({
      ...trip,
      destination: '\nNoruega \r\n Bcc: x@y.com\n',
      confirmationToken: 'token-123',
    })

    expect(subject).toBe(
      'Confirme sua presença na viagem para Noruega Bcc: x@y.com em 10 de março',
    )
  })

  it('should not html escape the subject', () => {
    const { subject } = participantInviteFormat({
      ...trip,
      destination: 'Bordeaux & Paris',
      confirmationToken: 'token-123',
    })

    expect(subject).toContain('Bordeaux & Paris')
  })

  it('should give each participant a distinct link', () => {
    const first = participantInviteFormat({
      ...trip,
      confirmationToken: 'token-1',
    })

    const second = participantInviteFormat({
      ...trip,
      confirmationToken: 'token-2',
    })

    expect(first.html).not.toBe(second.html)
    expect(first.html).toContain('token=token-1')
    expect(second.html).toContain('token=token-2')
  })

  it('should format the trip dates using the UTC day', () => {
    const { subject, html } = participantInviteFormat({
      destination: 'Noruega',
      startsAt: new Date('2026-03-10T00:00:00.000Z'),
      endsAt: new Date('2026-03-14T00:00:00.000Z'),
      confirmationToken: 'token-123',
    })

    expect(subject).toContain('em 10 de março')
    expect(html).toContain('10 de março até 14 de março')
  })
})
