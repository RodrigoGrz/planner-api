import z from 'zod'

export const createTripActivityBody = z.object({
  title: z.string(),
  occursAt: z.coerce.date(),
  tripId: z.uuid(),
})

export const createTripActivitySchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Create a trip activity.',
    security: [{ bearerAuth: [] }],
    body: createTripActivityBody,
    response: {
      201: z.null().describe('Trip activity created successfully'),
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
          'Possible reasons: A data está fora das datas da viagem | Recurso não encontrado.',
        ),
    },
  },
}
