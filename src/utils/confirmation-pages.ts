interface ConfirmationSuccessPageProps {
  destination: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function page({ title, message }: { title: string; message: string }) {
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
    </main>
  </body>
</html>
`.trim()
}

export function confirmationSuccessPage({
  destination,
}: ConfirmationSuccessPageProps) {
  return page({
    title: 'Presença confirmada!',
    message: `Sua presença na viagem para <strong style="color: #e2e8f0;">${escapeHtml(destination)}</strong> foi confirmada. Você já pode fechar esta página.`,
  })
}

export function confirmationErrorPage() {
  return page({
    title: 'Não foi possível confirmar',
    message:
      'Este link de confirmação é inválido ou já foi utilizado. Se você ainda não confirmou sua presença, peça um novo convite ao organizador da viagem.',
  })
}
