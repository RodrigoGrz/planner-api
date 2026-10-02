import { FastifyInstance } from 'fastify'
import fastifyFormbody from '@fastify/formbody'

import {
  confirmParticipantSchema,
  getInviteByTokenSchema,
} from './documentation/participants/confirm-participant-schema'

import { confirmParticipantController } from '../controllers/confirm-participant'
import { getInviteByTokenController } from '../controllers/get-invite-by-token'

export async function participantsRoute(app: FastifyInstance) {
  await app.register(fastifyFormbody)

  app.get(
    '/participants/confirm',
    getInviteByTokenSchema,
    getInviteByTokenController,
  )

  app.post(
    '/participants/confirm',
    confirmParticipantSchema,
    confirmParticipantController,
  )
}
