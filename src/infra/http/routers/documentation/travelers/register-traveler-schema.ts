import z from 'zod'

export const registerTravelerBody = z.object({
  name: z.string().min(3).max(100).describe('Full name of the traveler'),
  email: z.email().describe('Traveler email address'),
  password: z.string().min(6).max(50).describe('Password (min 6 characters)'),
  phone: z.string().min(10).max(15).describe('Phone number with country code'),
})

export const registerTravelerSchema = {
  schema: {
    tags: ['Traveler'],
    summary: 'Register a new traveler to manage trips.',
    body: registerTravelerBody,
    response: {
      201: z.null().describe('Traveler created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      409: z
        .object({
          message: z.string(),
        })
        .describe('Esse usuário já está cadastrado.'),
    },
  },
}
