import { prisma } from '@/infra/database/prisma/prisma'
import { getMailClient } from '@/mail'
import { participantInviteFormat } from '@/utils/mail-formats'
import { randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const createInvite = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/invites',
    {
      schema: {
        tags: ['participants'],
        summary: 'Invite someone to the trip.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      const confirmationToken = randomUUID()

      const participant = await prisma.participant.create({
        data: {
          trip_id: tripId,
          email,
          confirmation_token: confirmationToken,
        },
      })

      const mail = await getMailClient()

      const mailTemplate = participantInviteFormat({
        destination: trip.destination,
        startsAt: trip.starts_at,
        endsAt: trip.ends_at,
        confirmationToken,
      })

      const message = await mail.sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er',
        },
        to: participant.email,
        subject: mailTemplate.subject,
        html: mailTemplate.html,
      })

      console.log(nodemailer.getTestMessageUrl(message))

      return reply.status(201).send()
    },
  )
}
