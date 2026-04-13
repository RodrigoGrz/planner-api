import z from 'zod'

export const authenticateBody = z.object({
  email: z.email().describe('Traveler email address'),
  password: z.string().min(6).describe('Password (min 6 characters)'),
})

export const authenticateResponse = z.object({
  token: z.string().describe('JWT access token'),
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
    },
  },
}
