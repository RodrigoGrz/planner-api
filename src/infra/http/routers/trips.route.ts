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
import { deleteTripLinkSchema } from './documentation/trips/delete-trip-link-schema'
import { deleteTripLinkController } from '../controllers/delete-trip-link'
import { deleteTripActivitySchema } from './documentation/trips/delete-trip-activity-schema'
import { deleteTripActivityController } from '../controllers/delete-trip-activity'
import { deleteTripSchema } from './documentation/trips/delete-trip-schema'
import { deleteTripController } from '../controllers/delete-trip'
import { createInviteSchema } from './documentation/trips/create-invite-schema'
import { createInviteController } from '../controllers/create-invite'
import { inviteEmailsRateLimit } from '../rate-limits'
import { removeTripParticipantSchema } from './documentation/trips/remove-trip-participant-schema'
import { removeTripParticipantController } from '../controllers/remove-trip-participant'

export async function tripsRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/trips/:tripId', getTripDetailsSchema, getTripDetailsController)
  app.post(
    '/trips',
    { ...createTripSchema, config: { rateLimit: inviteEmailsRateLimit } },
    createTripController,
  )
  app.post(
    '/trips/:tripId/links',
    createTripLinkSchema,
    createTripLinkController,
  )
  app.post(
    '/trips/:tripId/activities',
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
    '/me/trips',
    getAllTravelersByTripSchema,
    getAllTravelersByTripController,
  )
  app.get(
    '/me/trips/next',
    getNextTripTravelerSchema,
    getNextTripTravelerController,
  )
  app.put('/trips/:tripId', updateTripSchema, updateTripController)
  app.put(
    '/trips/:tripId/cover-image',
    uploadTripCoverImageSchema,
    uploadTripCoverImageController,
  )
  app.post(
    '/trips/:tripId/invites',
    { ...createInviteSchema, config: { rateLimit: inviteEmailsRateLimit } },
    createInviteController,
  )
  app.delete('/trips/:tripId', deleteTripSchema, deleteTripController)
  app.delete(
    '/trips/:tripId/links/:linkId',
    deleteTripLinkSchema,
    deleteTripLinkController,
  )
  app.delete(
    '/trips/:tripId/activities/:activityId',
    deleteTripActivitySchema,
    deleteTripActivityController,
  )
  app.delete(
    '/trips/:tripId/participants/:participantId',
    removeTripParticipantSchema,
    removeTripParticipantController,
  )
}
