import { TravelerAlreadyExistsError } from '@/domain/trip/application/use-cases/errors/traveler-already-exists-error'
import { registerTravelerFactory } from '@/domain/trip/application/use-cases/factory/register-traveler-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

const registerTravelerBody = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string(),
})

export async function registerTravelerController(
  request: FastifyRequest,
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
        return reply.status(409).send(error.message)
      default:
        return reply.status(400).send(error.message)
    }
  }

  return reply.status(201).send()
}
