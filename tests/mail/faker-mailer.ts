import { Mailer, SendMailParams } from '@/domain/trip/application/mail/mailer'

interface SentMail {
  to: string
  subject: string
  html: string
}

export class FakeMailer implements Mailer {
  public sentMails: SentMail[] = []
  public failingAddresses = new Set<string>()

  async send({ to, subject, html }: SendMailParams): Promise<void> {
    if (this.failingAddresses.has(to.address)) {
      throw new Error('Falha ao enviar e-mail')
    }

    this.sentMails.push({
      to: to.address,
      subject,
      html,
    })
  }
}
