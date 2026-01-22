import { Mailer, SendMailParams } from '@/domain/trip/application/mail/mailer'

interface SentMail {
  to: string
  subject: string
  html: string
}

export class FakeMailer implements Mailer {
  public sentMails: SentMail[] = []

  async send({ to, subject, html }: SendMailParams): Promise<void> {
    this.sentMails.push({
      to: to.address,
      subject,
      html,
    })
  }
}
