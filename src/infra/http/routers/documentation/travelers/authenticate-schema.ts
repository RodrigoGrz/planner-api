import z from 'zod'
import { emailAddress } from '../shared/email-address'
import { tooManyRequestsResponse } from '../shared/too-many-requests-response'
import { password } from '../shared/password'

export const authenticateBody = z.object({
  email: emailAddress.describe('Traveler email address'),
  password,
})

export const authenticateResponse = z.object({
  token: z
    .string()
    .describe(
      'JWT access token, expires after JWT_EXPIRES_IN (default 7 days)',
    ),
  user: z.object({
    id: z.uuidv4(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
})

export const errorSchema = z.object({
  message: z.string(),
})

export const authenticateSchema = {
  schema: {
    tags: ['Traveler'],
    summary: 'Authenticate a traveler and return a JWT token.',
    body: authenticateBody,
    response: {
      200: authenticateResponse.describe('Authenticated successfully'),
      400: errorSchema.describe('Bad request'),
      401: errorSchema.describe('E-mail ou senha incorreta.'),
      429: tooManyRequestsResponse,
    },
  },
}
