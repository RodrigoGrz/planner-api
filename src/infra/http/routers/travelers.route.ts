import { FastifyInstance } from 'fastify'

import { registerTravelerSchema } from './documentation/travelers/register-traveler-schema'
import { authenticateSchema } from './documentation/travelers/authenticate-schema'

import { authenticateController } from '../controllers/authenticate'
import { registerTravelerController } from '../controllers/register-traveler'
import {
  authenticateRateLimit,
  registerTravelerRateLimit,
} from '../rate-limits'

export async function travelersRoute(app: FastifyInstance) {
  app.post(
    '/travelers/auth',
    { ...authenticateSchema, config: { rateLimit: authenticateRateLimit } },
    authenticateController,
  )
  app.post(
    '/travelers/register',
    {
      ...registerTravelerSchema,
      config: { rateLimit: registerTravelerRateLimit },
    },
    registerTravelerController,
  )
}
