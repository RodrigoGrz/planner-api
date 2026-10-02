import { env } from '@/env'
import { dayjs } from '@/lib/dayjs'
import { escapeHtml } from './escape-html'

interface ParticipantInviteFormatProps {
  destination: string
  startsAt: Date
  endsAt: Date
  confirmationToken: string
}

export function participantInviteFormat({
  destination,
  startsAt,
  endsAt,
  confirmationToken,
}: ParticipantInviteFormatProps) {
  const formattedTripStartDate = dayjs.utc(startsAt).format('D[ de ]MMMM')
  const formattedTripEndDate = dayjs.utc(endsAt).format('D[ de ]MMMM')

  const confirmationLink = new URL('/participants/confirm', env.API_BASE_URL)
  confirmationLink.searchParams.set('token', confirmationToken)

  const subjectDestination = destination.replace(/\s*[\r\n]+\s*/g, ' ').trim()
  const safeDestination = escapeHtml(destination)

  const subject = `Confirme sua presença na viagem para ${subjectDestination} em ${formattedTripStartDate}`

  const html = `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você foi convidado(a) para participar de uma viagem para <strong>${safeDestination}</strong> nas datas de <strong>${formattedTripStartDate} até ${formattedTripEndDate}</strong>.</p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink.toString()}">Confirmar presença</a>
            </p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>
        `.trim()

  return {
    subject,
    html,
  }
}
