import { FastifyInstance } from 'fastify'

import { confirmParticipantSchema } from './documentation/participants/confirm-participant-schema'

import { confirmParticipantController } from '../controllers/confirm-participant'

export async function participantsRoute(app: FastifyInstance) {
  app.get(
    '/participants/confirm',
    confirmParticipantSchema,
    confirmParticipantController,
  )
}
