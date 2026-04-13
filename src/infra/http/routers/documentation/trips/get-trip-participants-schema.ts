import z from 'zod'

export const getTripParticipantsParams = z.object({
  tripId: z.uuid(),
})

export const getTripParticipantsResponse = z.object({
  participants: z.array(
    z.object({
      id: z.uuidv4(),
      name: z.string(),
      email: z.email(),
      isConfirmed: z.boolean(),
    }),
  ),
})

export const getTripParticipantsSchema = {
  schema: {
    tags: ['Trip'],
    summary: 'Get trip participants.',
    security: [{ bearerAuth: [] }],
    params: getTripParticipantsParams,
    response: {
      200: getTripParticipantsResponse.describe(
        'Trip participants found successfully',
      ),
    },
  },
}
