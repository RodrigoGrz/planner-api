import z from 'zod'

export const confirmParticipantQuerystring = z.object({
  token: z.string().optional(),
})

export const confirmParticipantSchema = {
  schema: {
    tags: ['participants'],
    summary: 'Confirms a participant on a trip through the e-mailed token.',
    description:
      'Public endpoint. Responds with an HTML page: 200 on success, 404 when the token is invalid or already used.',
    querystring: confirmParticipantQuerystring,
  },
}
