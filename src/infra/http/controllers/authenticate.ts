import { CredentialsIncorrectError } from '@/domain/trip/application/use-cases/errors/credentials-incorrect-error'
import { authenticateFactory } from '@/domain/trip/application/use-cases/factory/authenticate-factory'
import { FastifyReply, FastifyRequest } from 'fastify'
import { TravelerPresenter } from '../presenters/traveler-presenter'
import { authenticateBody } from '../routers/documentation/travelers/authenticate-schema'
import z from 'zod'

type AuthenticateBody = z.infer<typeof authenticateBody>

export async function authenticateController(
  request: FastifyRequest<{ Body: AuthenticateBody }>,
  reply: FastifyReply,
) {
  const { email, password } = authenticateBody.parse(request.body)

  const authenticateUseCase = authenticateFactory()

  const result = await authenticateUseCase.execute({
    email,
    password,
  })

  if (result.isLeft()) {
    const error = result.value

    switch (error.constructor) {
      case CredentialsIncorrectError:
        return reply.status(401).send({ message: error.message })
      default:
        return reply.status(400).send({ message: error.message })
    }
  }

  const traveler = result.value.traveler

  const token = await reply.jwtSign(
    {},
    {
      sign: {
        sub: traveler.id.toString(),
      },
    },
  )

  return reply.send({
    token,
    user: TravelerPresenter.toHTTP(result.value.traveler),
  })
}
