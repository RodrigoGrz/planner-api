import { env } from '@/env'
import { participantInviteFormat } from './mail-formats'

describe('participantInviteFormat', () => {
  const trip = {
    destination: 'Noruega',
    startsAt: new Date('2026-03-10T12:00:00'),
    endsAt: new Date('2026-03-14T12:00:00'),
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
})
