import z from 'zod'
import { tooManyRequestsResponse } from '../shared/too-many-requests-response'

const htmlResponses = {
  200: z.string().describe('HTML page'),
  404: z
    .string()
    .describe('HTML page: the token is missing, invalid or already used'),
  410: z.string().describe('HTML page: the trip already ended'),
  429: tooManyRequestsResponse,
}

export const getInviteByTokenQuerystring = z.object({
  token: z.string().optional(),
})

export const getInviteByTokenSchema = {
  schema: {
    tags: ['participants'],
    summary: 'Shows the invite confirmation page for the e-mailed token.',
    description:
      'Public endpoint linked from the invite e-mail. Responds with an HTML page and never confirms the participant: the page has a form that posts the token to confirm.',
    querystring: getInviteByTokenQuerystring,
    produces: ['text/html'],
    response: htmlResponses,
  },
}

export const confirmParticipantBody = z.object({
  token: z.string().optional(),
})

export const confirmParticipantSchema = {
  schema: {
    tags: ['participants'],
    summary: 'Confirms a participant on a trip through the invite token.',
    description:
      'Public endpoint posted by the confirmation page form. Responds with an HTML page.',
    consumes: ['application/x-www-form-urlencoded'],
    produces: ['text/html'],
    body: confirmParticipantBody,
    response: htmlResponses,
  },
}
