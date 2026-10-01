import { app } from '@/infra/app'
import { errorHandler } from '@/infra/http/error-handler'
import { fastify, FastifyInstance } from 'fastify'
import request from 'supertest'

describe('Error handler (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /travelers/auth returns 400 for a malformed JSON body', async () => {
    const response = await request(app.server)
      .post('/travelers/auth')
      .set('Content-Type', 'application/json')
      .send('{')

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toEqual(expect.any(String))
  })

  test('[POST] /travelers/auth returns 415 for an unsupported content type', async () => {
    const response = await request(app.server)
      .post('/travelers/auth')
      .set('Content-Type', 'application/xml')
      .send('<email>john@planner.com</email>')

    expect(response.statusCode).toBe(415)
  })

  describe('isolated instance', () => {
    let isolatedApp: FastifyInstance

    beforeAll(async () => {
      isolatedApp = fastify()
      isolatedApp.setErrorHandler(errorHandler)

      isolatedApp.get('/unexpected', async () => {
        throw new Error('relation "travelers" violates unique constraint')
      })

      isolatedApp.get('/conflict', async () => {
        throw Object.assign(new Error('Conflito'), { statusCode: 409 })
      })

      await isolatedApp.ready()
    })

    afterAll(async () => {
      await isolatedApp.close()
    })

    test('returns 500 without internal details for unexpected errors', async () => {
      const response = await isolatedApp.inject({
        method: 'GET',
        url: '/unexpected',
      })

      expect(response.statusCode).toBe(500)
      expect(response.json()).toEqual({ message: 'Internal server error' })
      expect(response.body).not.toContain('travelers')
    })

    test('keeps the status and message of client errors', async () => {
      const response = await isolatedApp.inject({
        method: 'GET',
        url: '/conflict',
      })

      expect(response.statusCode).toBe(409)
      expect(response.json()).toEqual({ message: 'Conflito' })
    })
  })
})
