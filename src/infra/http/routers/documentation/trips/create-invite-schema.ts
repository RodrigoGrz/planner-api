import z from 'zod'

export const createInviteParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
})

export const createInviteBody = z.object({
  email: z.email(),
})

export const createInviteSchema = {
  schema: {
    tags: ['participants'],
    summary: 'Invite someone to the trip.',
    security: [{ bearerAuth: [] }],
    params: createInviteParams,
    body: createInviteBody,
    response: {
      201: z.null().describe('Invite created successfully'),
      400: z
        .object({
          message: z.string(),
        })
        .describe('Bad request'),
      403: z
        .object({
          message: z.string(),
        })
        .describe('Não permitido'),
      409: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
    },
  },
}
