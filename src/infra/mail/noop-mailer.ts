import { Mailer } from '@/domain/trip/application/mail/mailer'

export class NoopMailer implements Mailer {
  async send(): Promise<void> {}
}
