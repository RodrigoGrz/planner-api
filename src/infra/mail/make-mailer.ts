import { Mailer } from '@/domain/trip/application/mail/mailer'
import { env } from '@/env'
import { NodemailerMailer } from './nodemailer-mailer'
import { NoopMailer } from './noop-mailer'

let mailer: Promise<Mailer> | undefined

export async function makeMailer(): Promise<Mailer> {
  if (env.NODE_ENV === 'test') {
    return new NoopMailer()
  }

  mailer ??= NodemailerMailer.create().catch((error) => {
    mailer = undefined
    throw error
  })

  return mailer
}
