import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastifyMultipart from '@fastify/multipart'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import { env } from '@/env'
import { travelersRoute } from './http/routers/travelers.route'
import { tripsRoute } from './http/routers/trips.route'
import { participantsRoute } from './http/routers/participants.route'
import { errorHandler } from './http/error-handler'
import { requestLogSerializers } from './http/request-log-serializers'
import { TOO_MANY_REQUESTS_MESSAGE } from './http/rate-limits'

const MAX_UPLOAD_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024

export const app = fastify({
  logger: env.NODE_ENV !== 'test' && { serializers: requestLogSerializers },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: env.JWT_EXPIRES_IN,
  },
})

if (env.RATE_LIMIT_ENABLED) {
  app.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      message: TOO_MANY_REQUESTS_MESSAGE,
    }),
  })
}

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'planner',
      description: 'Especificações da API para o back-end da aplicação planner',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyMultipart, {
  limits: {
    fileSize: MAX_UPLOAD_FILE_SIZE_IN_BYTES,
  },
})

app.register(fastifyCors, {
  origin: '*',
  credentials: true,
})

app.register(travelersRoute)
app.register(tripsRoute)
app.register(participantsRoute)
