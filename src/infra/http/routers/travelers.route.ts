import { FastifyInstance } from 'fastify'

import { authenticateController } from '../controllers/authenticate'
import { registerTravelerController } from '../controllers/register-traveler'

export async function travelersRoute(app: FastifyInstance) {
  app.post('/travelers/auth', authenticateController)
  app.post('/travelers/register', registerTravelerController)
}
