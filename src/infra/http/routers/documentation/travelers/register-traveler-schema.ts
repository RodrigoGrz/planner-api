import z from 'zod'
import { emailAddress } from '../shared/email-address'
import { tooManyRequestsResponse } from '../shared/too-many-requests-response'
import { password } from '../shared/password'

export const registerTravelerBody = z.object({
  name: z.string().trim().min(3).max(100).describe('Full name of the traveler'),
  email: emailAddress.describe('Traveler email address'),
  password,
  phone: z
    .string()
    .trim()
    .regex(/^[\d+\s()-]+$/)
    .max(20)
    .refine((value) => value.replace(/\D/g, '').length >= 10, {
      message: 'Phone must have at least 10 digits',
    })
    .describe('Phone number with country code'),
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
      429: tooManyRequestsResponse,
    },
  },
}
