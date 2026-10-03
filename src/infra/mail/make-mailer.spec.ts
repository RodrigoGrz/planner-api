import { Mailer } from '@/domain/trip/application/mail/mailer'

const env = vi.hoisted(() => ({ NODE_ENV: 'development' }))
const create = vi.hoisted(() => vi.fn())

vi.mock('@/env', () => ({ env }))
vi.mock('./nodemailer-mailer', () => ({ NodemailerMailer: { create } }))

const mailer: Mailer = { send: vi.fn() }

async function importMakeMailer() {
  vi.resetModules()
  const { makeMailer } = await import('./make-mailer')

  return makeMailer
}

describe('Make mailer', () => {
  beforeEach(() => {
    create.mockReset()
    env.NODE_ENV = 'development'
  })

  it('should be able to create the nodemailer mailer only once', async () => {
    create.mockResolvedValue(mailer)
    const makeMailer = await importMakeMailer()

    const first = await makeMailer()
    const second = await makeMailer()

    expect(first).toBe(mailer)
    expect(second).toBe(mailer)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('should be able to create the mailer again after a failed creation', async () => {
    create
      .mockRejectedValueOnce(new Error('SMTP indisponível'))
      .mockResolvedValueOnce(mailer)
    const makeMailer = await importMakeMailer()

    await expect(makeMailer()).rejects.toThrow('SMTP indisponível')
    await expect(makeMailer()).resolves.toBe(mailer)
    expect(create).toHaveBeenCalledTimes(2)
  })

  it('should be able to return a noop mailer in the test environment', async () => {
    env.NODE_ENV = 'test'
    const makeMailer = await importMakeMailer()
    const { NoopMailer } = await import('./noop-mailer')

    const result = await makeMailer()

    expect(result).toBeInstanceOf(NoopMailer)
    expect(create).not.toHaveBeenCalled()
  })
})
