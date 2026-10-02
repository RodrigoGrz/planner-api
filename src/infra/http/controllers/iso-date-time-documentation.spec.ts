import { app } from '@/infra/app'

type RequestBodyProperties = Record<string, { type?: string; format?: string }>

type OpenApiDocument = {
  paths: Record<
    string,
    Record<
      string,
      {
        requestBody?: {
          content: Record<
            string,
            { schema: { properties: RequestBodyProperties } }
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

describe('ISO date-time documentation (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
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
})
