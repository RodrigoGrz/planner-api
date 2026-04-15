import { env } from '@/env'
import { dayjs } from '@/lib/dayjs'

interface CreateTripFormatProps {
  tripId: string
  destination: string
  startsAt: Date
  endsAt: Date
}

export function createTripFormat({
  tripId,
  destination,
  startsAt,
  endsAt,
}: CreateTripFormatProps) {
  const formattedTripStartDate = dayjs(startsAt).format('D[ de ]MMMM')
  const formattedTripEndDate = dayjs(endsAt).format('D[ de ]MMMM')

  // REFAZER!!!
  const confirmationLink = new URL(`/trips/${tripId}/confirm`, env.API_BASE_URL)

  const subject = `Confirme sua viagem para ${destination} em ${formattedTripStartDate}`

  const html = `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de ${formattedTripStartDate} até ${formattedTripEndDate}.</p>
            <p></p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p></p>
            <p>
              <a href="${confirmationLink.toString()}">Confirmar viagem</a>
            </p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
          </div>
        `.trim()

  return {
    subject,
    html,
  }
}
