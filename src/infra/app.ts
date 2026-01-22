import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
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
      title: 'plann.er',
      description:
        'Especificações da API para o back-end da aplicação plann.er',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
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
