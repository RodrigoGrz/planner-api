import { Writable } from 'node:stream'
import { fastify, FastifyInstance } from 'fastify'
import { requestLogSerializers } from '@/infra/http/request-log-serializers'

describe('Request logging (E2E)', () => {
  let loggedApp: FastifyInstance
  let logOutput: string

  beforeAll(async () => {
    logOutput = ''

    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logOutput += chunk.toString()
        callback()
      },
    })

    loggedApp = fastify({
      logger: { serializers: requestLogSerializers, stream },
    })

    loggedApp.get('/participants/confirm', async () => ({ ok: true }))

    await loggedApp.ready()
  })

  afterAll(async () => {
    await loggedApp.close()
  })

  test('[GET] /participants/confirm does not log the query string', async () => {
    await loggedApp.inject({
      method: 'GET',
      url: '/participants/confirm?token=secret-confirmation-token',
    })

    expect(logOutput).toContain('/participants/confirm')
    expect(logOutput).not.toContain('secret-confirmation-token')
  })
})
