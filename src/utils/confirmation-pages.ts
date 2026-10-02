import { dayjs } from '@/lib/dayjs'
import { escapeHtml } from './escape-html'

interface ConfirmationSuccessPageProps {
  destination: string
}

interface ConfirmationPromptPageProps {
  destination: string
  startsAt: Date
  endsAt: Date
  token: string
}

interface PageProps {
  title: string
  message: string
  content?: string
}

function page({ title, message, content = '' }: PageProps) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; background: #0f172a; color: #e2e8f0; font-family: sans-serif;">
    <main style="max-width: 480px; margin: 0 auto; padding: 64px 24px; text-align: center;">
      <h1 style="font-size: 24px; line-height: 1.3;">${title}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">${message}</p>
      ${content}
    </main>
  </body>
</html>
`.trim()
}

function formatTripDay(date: Date) {
  return dayjs.utc(date).format('D[ de ]MMMM')
}

export function confirmationSuccessPage({
  destination,
}: ConfirmationSuccessPageProps) {
  return page({
    title: 'Presença confirmada!',
    message: `Sua presença na viagem para <strong style="color: #e2e8f0;">${escapeHtml(destination)}</strong> foi confirmada. Você já pode fechar esta página.`,
  })
}

export function confirmationPromptPage({
  destination,
  startsAt,
  endsAt,
  token,
}: ConfirmationPromptPageProps) {
  return page({
    title: 'Confirme sua presença',
    message: `Você foi convidado(a) para a viagem para <strong style="color: #e2e8f0;">${escapeHtml(destination)}</strong>, de <strong style="color: #e2e8f0;">${formatTripDay(startsAt)} até ${formatTripDay(endsAt)}</strong>.`,
    content: `<form method="post" action="/participants/confirm">
        <input type="hidden" name="token" value="${escapeHtml(token)}" />
        <button type="submit" style="margin-top: 24px; padding: 12px 24px; font-size: 16px; border: 0; border-radius: 8px; background: #bef264; color: #1a2e05; cursor: pointer;">Confirmar presença</button>
      </form>`,
  })
}

export function confirmationExpiredPage() {
  return page({
    title: 'Este convite expirou',
    message:
      'Esta viagem já terminou e o convite não pode mais ser confirmado. Se precisar, peça um novo convite ao organizador da viagem.',
  })
}

export function confirmationErrorPage() {
  return page({
    title: 'Não foi possível confirmar',
    message:
      'Este link de confirmação é inválido ou já foi utilizado. Se você ainda não confirmou sua presença, peça um novo convite ao organizador da viagem.',
  })
}
