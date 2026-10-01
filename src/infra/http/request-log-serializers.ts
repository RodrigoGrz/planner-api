import { FastifyRequest } from 'fastify'

export const requestLogSerializers = {
  req: (request: FastifyRequest) => ({
    method: request.method,
    url: request.url.split('?')[0],
  }),
}
