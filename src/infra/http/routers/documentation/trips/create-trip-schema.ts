import z from 'zod'

export const createTripBody = z
  .object({
    destination: z.string().min(3),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    emailsToInvite: z
      .array(z.email('Invalid e-mail format'))
      .max(20, 'You can invite up to 20 participants per trip')
      .transform((emails) => [...new Set(emails)]),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).setHours(0, 0, 0, 0)
      const end = new Date(data.endsAt).setHours(0, 0, 0, 0)

      return end >= start
    },
    {
      message: 'End date must be after start date',
      path: ['endsAt'],
    },
  )

export const createTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a new trip.',
    security: [{ bearerAuth: [] }],
    body: createTripBody,
    response: {
      201: z
        .object({
          tripId: z.uuidv4(),
        })
        .describe('Trip created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      409: z
        .object({
          message: z.string(),
        })
        .describe(
          'Possible reasons: Data de início inválida. | Data de fim inválida. | Recurso não encontrado.',
        ),
    },
  },
}
