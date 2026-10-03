import { Mailer, SendMailParams } from '@/domain/trip/application/mail/mailer'
import { env } from '@/env'
import nodemailer, { Transporter } from 'nodemailer'
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport'

export class NodemailerMailer implements Mailer {
  private transporter

  private constructor(transporter: Transporter<SentMessageInfo>) {
    this.transporter = transporter
  }

  static async create(): Promise<NodemailerMailer> {
    let user = env.MAIL_USER
    let pass = env.MAIL_PASS

    if (!user || !pass) {
      const account = await nodemailer.createTestAccount()
      user = account.user
      pass = account.pass
    }

    const transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: false,
      pool: true,
      maxConnections: 5,
      auth: {
        user,
        pass,
      },
    })

    return new NodemailerMailer(transporter)
  }

  async send({ to, subject, html }: SendMailParams): Promise<void> {
    const info = await this.transporter
      .sendMail({
        from: {
          name: 'Equipe plann.er',
          address: 'oi@plann.er',
        },
        to: {
          name: to.name ?? to.address.split('@')[0],
          address: to.address,
        },
        subject,
        html,
      })
      .catch((error: { code?: string; responseCode?: number }) => {
        throw Object.assign(new Error('Falha no envio SMTP'), {
          code: error.code,
          responseCode: error.responseCode,
        })
      })

    if (env.NODE_ENV === 'development') {
      console.log(nodemailer.getTestMessageUrl(info))
    }
  }
}
