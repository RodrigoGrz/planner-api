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

    loggedApp.get('/invites/confirmation', async () => ({ ok: true }))

    await loggedApp.ready()
  })

  afterAll(async () => {
    await loggedApp.close()
  })

  test('[GET] /invites/confirmation does not log the query string', async () => {
    await loggedApp.inject({
      method: 'GET',
      url: '/invites/confirmation?token=secret-confirmation-token',
    })

    expect(logOutput).toContain('/invites/confirmation')
    expect(logOutput).not.toContain('secret-confirmation-token')
  })
})
