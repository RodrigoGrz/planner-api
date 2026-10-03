import nodemailer from 'nodemailer'
import { SendMailParams } from '@/domain/trip/application/mail/mailer'
import { NodemailerMailer } from './nodemailer-mailer'

const env = vi.hoisted(() => ({
  NODE_ENV: 'test',
  MAIL_HOST: 'smtp.example.com',
  MAIL_PORT: 2525,
  MAIL_USER: 'mail-user' as string | undefined,
  MAIL_PASS: 'mail-pass' as string | undefined,
}))

vi.mock('@/env', () => ({ env }))

vi.mock('nodemailer', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof nodemailer }>()
  const original = actual.default

  return {
    ...actual,
    default: {
      ...original,
      createTransport: vi.fn(() =>
        original.createTransport({ streamTransport: true, buffer: true }),
      ),
      createTestAccount: vi.fn(async () => ({
        user: 'ethereal-user',
        pass: 'ethereal-pass',
      })),
    },
  }
})

async function sendAndReadRawMessage(params: SendMailParams) {
  const mailer = await NodemailerMailer.create()
  const transporter = vi.mocked(nodemailer.createTransport).mock.results[0]
    .value as ReturnType<typeof nodemailer.createTransport>
  const sendMail = vi.spyOn(transporter, 'sendMail')

  await mailer.send(params)

  const info = await sendMail.mock.results[0].value
  const [headers, body] = String(info.message).split('\r\n\r\n')

  return { headers, body, recipients: info.envelope.to }
}

describe('Nodemailer mailer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    env.MAIL_USER = 'mail-user'
    env.MAIL_PASS = 'mail-pass'
  })

  it('should be able to send an email with the plann.er sender, recipient, subject and html', async () => {
    const { headers, body } = await sendAndReadRawMessage({
      to: { name: 'John Doe', address: 'john@example.com' },
      subject: 'Trip invite',
      html: '<h1>Trip invite</h1>',
    })

    expect(headers).toContain('From: "Equipe plann.er" <oi@plann.er>')
    expect(headers).toContain('To: John Doe <john@example.com>')
    expect(headers).toContain('Subject: Trip invite')
    expect(headers).toContain('Content-Type: text/html')
    expect(body).toContain('<h1>Trip invite</h1>')
  })

  it('should be able to use the email local part as recipient name when the name is null', async () => {
    const { headers } = await sendAndReadRawMessage({
      to: { name: null, address: 'jane@example.com' },
      subject: 'Trip invite',
      html: '<h1>Trip invite</h1>',
    })

    expect(headers).toContain('To: jane <jane@example.com>')
  })

  it('should be able to create the smtp transport with MAIL_USER and MAIL_PASS when they are configured', async () => {
    await NodemailerMailer.create()

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 2525,
      secure: false,
      pool: true,
      maxConnections: 5,
      auth: { user: 'mail-user', pass: 'mail-pass' },
    })
    expect(nodemailer.createTestAccount).not.toHaveBeenCalled()
  })

  it('should not be able to expose the recipient address when the smtp server rejects it', async () => {
    const mailer = await NodemailerMailer.create()
    const transporter = vi.mocked(nodemailer.createTransport).mock.results[0]
      .value as ReturnType<typeof nodemailer.createTransport>
    const response = '550 5.1.1 <john@example.com>: Recipient address rejected'

    vi.spyOn(transporter, 'sendMail').mockRejectedValueOnce(
      Object.assign(
        new Error(
          `Can't send mail - all recipients were rejected: ${response}`,
        ),
        {
          code: 'EENVELOPE',
          responseCode: 550,
          response,
          rejected: ['john@example.com'],
        },
      ),
    )

    const error = await mailer
      .send({
        to: { name: 'John Doe', address: 'john@example.com' },
        subject: 'Trip invite',
        html: '<h1>Trip invite</h1>',
      })
      .catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({
      message: 'Falha no envio SMTP',
      code: 'EENVELOPE',
      responseCode: 550,
    })
    expect(error).not.toHaveProperty('rejected')
    expect(error).not.toHaveProperty('response')
    expect(JSON.stringify(error)).not.toContain('john@example.com')
  })

  it('should be able to create an Ethereal test account when the mail credentials are missing', async () => {
    env.MAIL_USER = undefined
    env.MAIL_PASS = undefined

    await NodemailerMailer.create()

    expect(nodemailer.createTestAccount).toHaveBeenCalledTimes(1)
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: { user: 'ethereal-user', pass: 'ethereal-pass' },
      }),
    )
  })

  it('should not be able to inject headers through a recipient name with line breaks', async () => {
    const { headers, recipients } = await sendAndReadRawMessage({
      to: {
        name: 'John\r\nBcc: attacker@example.com',
        address: 'john@example.com',
      },
      subject: 'Trip invite',
      html: '<h1>Trip invite</h1>',
    })

    expect(headers).not.toMatch(/^Bcc:/im)
    expect(recipients).toEqual(['john@example.com'])
  })
})
