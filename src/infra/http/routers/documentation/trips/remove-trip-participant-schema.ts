import z from 'zod'

export const removeTripParticipantParams = z.object({
  tripId: z.uuid().describe('Trip unique identifier'),
  participantId: z.uuid().describe('Participant unique identifier'),
})

export const removeTripParticipantSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Remove a participant from the trip (owner only)',
    security: [{ bearerAuth: [] }],
    params: removeTripParticipantParams,
    response: {
      204: z.null().describe('Participant removed'),
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
      404: z
        .object({
          message: z.string(),
        })
        .describe('Recurso não encontrado.'),
      422: z
        .object({
          message: z.string(),
        })
        .describe('O dono não pode sair da própria viagem.'),
    },
  },
}
