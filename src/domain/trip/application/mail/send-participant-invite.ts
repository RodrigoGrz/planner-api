import { participantInviteFormat } from '@/utils/mail-formats'
import { Participant } from '../../enterprise/entities/participant'
import { Trip } from '../../enterprise/entities/trip'
import { Mailer } from './mailer'

interface SendParticipantInviteParams {
  trip: Trip
  participant: Participant
  confirmationToken: string
}

export async function sendParticipantInvite(
  mailer: Mailer,
  { trip, participant, confirmationToken }: SendParticipantInviteParams,
) {
  const mailTemplate = participantInviteFormat({
    destination: trip.destination,
    startsAt: trip.startsAt,
    endsAt: trip.endsAt,
    confirmationToken,
  })

  await mailer.send({
    to: {
      name: participant.name,
      address: participant.email,
    },
    subject: mailTemplate.subject,
    html: mailTemplate.html,
  })
}
