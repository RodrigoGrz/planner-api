import z from 'zod'

export const getAllTravelersByTripResponse = z.object({
  trips: z.array(
    z.object({
      participantId: z.uuidv4(),
      tripId: z.uuidv4(),
      name: z
        .string()
        .nullable()
        .describe(
          'Participant name; null while the invited person has no account',
        ),
      email: z.email(),
      isConfirmed: z.boolean(),
      destination: z.string(),
      startsAt: z.date(),
      endsAt: z.date(),
      coverImageUrl: z.url().nullable(),
    }),
  ),
})

export const getAllTravelersByTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get all travelers by trip.',
    security: [{ bearerAuth: [] }],
    response: {
      200: getAllTravelersByTripResponse.describe('All travelers by trip'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      404: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
    },
  },
}
