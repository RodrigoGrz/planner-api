import { Mailer } from '@/domain/trip/application/mail/mailer'
import { env } from '@/env'
import { NodemailerMailer } from './nodemailer-mailer'
import { NoopMailer } from './noop-mailer'

export async function makeMailer(): Promise<Mailer> {
  if (env.NODE_ENV === 'test') {
    return new NoopMailer()
  }

  return NodemailerMailer.create()
}
