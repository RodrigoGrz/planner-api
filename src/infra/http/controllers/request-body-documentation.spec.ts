import { app } from '@/infra/app'

type PropertySchema = {
  type?: string
  format?: string
  items?: PropertySchema
}

type OpenApiDocument = {
  paths: Record<
    string,
    Record<
      string,
      {
        requestBody?: {
          content: Record<
            string,
            { schema: { properties: Record<string, PropertySchema> } }
          >
        }
      }
    >
  >
}

function getRequestBodyProperties(path: string, method: string) {
  const document = app.swagger() as OpenApiDocument

  return document.paths[path]?.[method]?.requestBody?.content[
    'application/json'
  ]?.schema.properties
}

describe('Request body documentation (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /docs/json is available outside production', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveProperty('openapi', '3.0.0')
  })

  test.each([
    ['POST', '/trips/register', ['startsAt', 'endsAt']],
    ['PUT', '/trips/{tripId}/update', ['startsAt', 'endsAt']],
    ['POST', '/trips/activity/register', ['occursAt']],
  ])(
    '[%s] %s documents its dates as ISO date-time strings',
    (method, path, fields) => {
      const properties = getRequestBodyProperties(path, method.toLowerCase())

      for (const field of fields) {
        expect(properties?.[field]).toEqual(
          expect.objectContaining({ type: 'string', format: 'date-time' }),
        )
      }
    },
  )

  test.each([
    ['/travelers/register', 'email'],
    ['/travelers/auth', 'email'],
    ['/trips/{tripId}/invites', 'email'],
  ])('[POST] %s documents %s as an e-mail string', (path, field) => {
    const properties = getRequestBodyProperties(path, 'post')

    expect(properties?.[field]).toEqual(
      expect.objectContaining({ type: 'string', format: 'email' }),
    )
  })

  test('[POST] /trips/register documents emailsToInvite as e-mail strings', () => {
    const properties = getRequestBodyProperties('/trips/register', 'post')

    expect(properties?.emailsToInvite?.items).toEqual(
      expect.objectContaining({ type: 'string', format: 'email' }),
    )
  })
})
