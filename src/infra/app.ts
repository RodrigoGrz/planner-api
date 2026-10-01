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
import { env } from '@/env'
import { travelersRoute } from './http/routers/travelers.route'
import { tripsRoute } from './http/routers/trips.route'
import { participantsRoute } from './http/routers/participants.route'
import { errorHandler } from './http/error-handler'
import { requestLogSerializers } from './http/request-log-serializers'

const MAX_UPLOAD_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024

export const app = fastify({
  logger: env.NODE_ENV !== 'test' && { serializers: requestLogSerializers },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

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
