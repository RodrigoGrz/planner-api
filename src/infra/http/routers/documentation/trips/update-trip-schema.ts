import z from 'zod'

export const updateTripParams = z.object({
  tripId: z.uuid(),
})

export const updateTripBody = z.object({
  destination: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})

export const updateTripSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Update a new trip.',
    security: [{ bearerAuth: [] }],
    body: updateTripBody,
    response: {
      204: z.null().describe('Trip update successfully'),
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
