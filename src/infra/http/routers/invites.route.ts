import { FastifyInstance } from 'fastify'
import fastifyFormbody from '@fastify/formbody'

import {
  confirmParticipantSchema,
  getInviteByTokenSchema,
} from './documentation/invites/invite-confirmation-schema'

import { confirmParticipantController } from '../controllers/confirm-participant'
import { getInviteByTokenController } from '../controllers/get-invite-by-token'
import { participantConfirmRateLimit } from '../rate-limits'

export async function invitesRoute(app: FastifyInstance) {
  await app.register(fastifyFormbody)

  app.get(
    '/invites/confirmation',
    {
      ...getInviteByTokenSchema,
      config: { rateLimit: participantConfirmRateLimit },
    },
    getInviteByTokenController,
  )

  app.post(
    '/invites/confirmation',
    {
      ...confirmParticipantSchema,
      config: { rateLimit: participantConfirmRateLimit },
    },
    confirmParticipantController,
  )
}
