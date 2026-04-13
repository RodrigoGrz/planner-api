import { FastifyInstance } from 'fastify'

import { createTripController } from '../controllers/create-trip'
import { getTripDetailsController } from '../controllers/get-trip-details'
import { getTripLinksController } from '../controllers/get-trip-links'
import { getTripActivitiesController } from '../controllers/get-trip-activities'
import { createTripLinkController } from '../controllers/create-trip-link'
import { createTripActivityController } from '../controllers/create-trip-activity'
import { updateTripController } from '../controllers/update-trip'
import { getTripParticipantsController } from '../controllers/get-trip-participants'
import { verifyJWT } from '../middlewares/verify-jwt'
import { getAllTravelerTripsController } from '../controllers/get-all-traveler-trips'
import { getNextTripTravelerController } from '../controllers/get-next-trip-traveler'
import { uploadTripCoverImageController } from '../controllers/upload-trip-cover-image'
import { getTripDetailsSchema } from './documentation/trips/get-trip-details-schema'
import { createTripSchema } from './documentation/trips/create-trip-schema'
import { createTripLinkSchema } from './documentation/trips/create-trip-link-schema'

export async function tripsRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/trips/:id', getTripDetailsSchema, getTripDetailsController)
  app.post('/trips/register', createTripSchema, createTripController)
  app.post(
    '/trips/link/register',
    createTripLinkSchema,
    createTripLinkController,
  )
  app.post('/trips/activity/register', createTripActivityController)
  app.get('/trips/:tripId/links', getTripLinksController)
  app.get('/trips/:tripId/activities', getTripActivitiesController)
  app.get('/trips/:tripId/participants', getTripParticipantsController)
  app.get('/traveler/trips', getAllTravelerTripsController)
  app.get('/traveler/next/trip', getNextTripTravelerController)
  app.put('/trips/:tripId/update', updateTripController)
  app.post('/trips/:tripId/image', uploadTripCoverImageController)
}
