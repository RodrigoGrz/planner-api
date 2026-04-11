import { TravelerAlreadyExistsError } from '@/domain/trip/application/use-cases/errors/traveler-already-exists-error'
import { registerTravelerFactory } from '@/domain/trip/application/use-cases/factory/register-traveler-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { registerTravelerBody } from '../routers/documentation/travelers/register-traveler-schema'
import z from 'zod'

type RegisterTravelerBody = z.infer<typeof registerTravelerBody>

export async function registerTravelerController(
  request: FastifyRequest<{ Body: RegisterTravelerBody }>,
  reply: FastifyReply,
) {
  const { name, email, password, phone } = registerTravelerBody.parse(
    request.body,
  )

  const registerTravelerUseCase = registerTravelerFactory()

  const result = await registerTravelerUseCase.execute({
    name,
    email,
    password,
    phone,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case TravelerAlreadyExistsError:
        return reply.status(409).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  return reply.status(201).send()
}
