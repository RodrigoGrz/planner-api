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

import { confirmTrip } from './http/routers/confirm-trip'
import { createInvite } from './http/routers/create-invite'
import { confirmParticipant } from './http/routers/confirm-participant'
import fastifyJwt from '@fastify/jwt'
import { env } from '@/env'
import { travelersRoute } from './http/routers/travelers.route'
import { tripsRoute } from './http/routers/trips.route'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
})

app.register(fastifyCors, {
  origin: '*',
  credentials: true,
})

app.register(travelersRoute)
app.register(tripsRoute)

app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createInvite)
