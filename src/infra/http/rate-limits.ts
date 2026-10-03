import { FastifyRequest } from 'fastify'

export const TOO_MANY_REQUESTS_MESSAGE =
  'Muitas requisições. Tente novamente mais tarde.'

export const authenticateRateLimit = {
  max: 10,
  timeWindow: '1 minute',
} as const

export const registerTravelerRateLimit = {
  max: 5,
  timeWindow: '1 hour',
} as const

export const inviteEmailsRateLimit = {
  max: 20,
  timeWindow: '1 hour',
  hook: 'preHandler',
  keyGenerator: (request: FastifyRequest) => request.user.sub,
} as const

export const participantConfirmRateLimit = {
  max: 20,
  timeWindow: '1 minute',
} as const
