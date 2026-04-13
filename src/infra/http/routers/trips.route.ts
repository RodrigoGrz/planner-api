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
import { getNextTripTravelerController } from '../controllers/get-next-trip-traveler'
import { uploadTripCoverImageController } from '../controllers/upload-trip-cover-image'
import { getAllTravelersByTripController } from '../controllers/get-all-travelers-by-trip'
import { getTripDetailsSchema } from './documentation/trips/get-trip-details-schema'
import { createTripSchema } from './documentation/trips/create-trip-schema'
import { createTripLinkSchema } from './documentation/trips/create-trip-link-schema'
import { createTripActivitySchema } from './documentation/trips/create-trip-activity-schema'
import { getTripLinksSchema } from './documentation/trips/get-trip-links-schema'
import { getTripActivitiesSchema } from './documentation/trips/get-trip-activities-schema'
import { getTripParticipantsSchema } from './documentation/trips/get-trip-participants-schema'
import { getAllTravelersByTripSchema } from './documentation/trips/get-all-travelers-by-trip-schema'
import { getNextTripTravelerSchema } from './documentation/trips/get-next-trip-traveler-schema'
import { updateTripSchema } from './documentation/trips/update-trip-schema'
import { uploadTripCoverImageSchema } from './documentation/trips/upload-trip-cover-image-schema'

export async function tripsRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/trips/:id', getTripDetailsSchema, getTripDetailsController)
  app.post('/trips/register', createTripSchema, createTripController)
  app.post(
    '/trips/link/register',
    createTripLinkSchema,
    createTripLinkController,
  )
  app.post(
    '/trips/activity/register',
    createTripActivitySchema,
    createTripActivityController,
  )
  app.get('/trips/:tripId/links', getTripLinksSchema, getTripLinksController)
  app.get(
    '/trips/:tripId/activities',
    getTripActivitiesSchema,
    getTripActivitiesController,
  )
  app.get(
    '/trips/:tripId/participants',
    getTripParticipantsSchema,
    getTripParticipantsController,
  )
  app.get(
    '/traveler/trips',
    getAllTravelersByTripSchema,
    getAllTravelersByTripController,
  )
  app.get(
    '/traveler/next/trip',
    getNextTripTravelerSchema,
    getNextTripTravelerController,
  )
  app.put('/trips/:tripId/update', updateTripSchema, updateTripController)
  app.post(
    '/trips/:tripId/image',
    uploadTripCoverImageSchema,
    uploadTripCoverImageController,
  )
}
