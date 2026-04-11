import { FastifyInstance } from 'fastify'

import { authenticateController } from '../controllers/authenticate'
import { registerTravelerController } from '../controllers/register-traveler'
import { registerTravelerSchema } from './documentation/travelers/register-traveler-schema'
import { authenticateSchema } from './documentation/travelers/authenticate-schema'

export async function travelersRoute(app: FastifyInstance) {
  app.post('/travelers/auth', authenticateSchema, authenticateController)
  app.post(
    '/travelers/register',
    registerTravelerSchema,
    registerTravelerController,
  )
}
