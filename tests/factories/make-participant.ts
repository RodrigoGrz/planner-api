import { faker } from '@faker-js/faker'
import {
  Participant,
  ParticipantProps,
} from '@/domain/trip/enterprise/entities/participant'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { prisma } from '@/infra/database/prisma/prisma'
import { PrismaParticipantsMapper } from '@/infra/database/prisma/mappers/prisma-participant-mapper'

export async function makeParticipant(
  override: Partial<ParticipantProps> = {},
  id?: string,
) {
  const participant = Participant.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      isConfirmed: false,
      travelerId: new UniqueEntityID(),
      tripId: new UniqueEntityID(),
      ...override,
    },
    new UniqueEntityID(id),
  )

  return participant
}

export async function makePrismaParticipant(
  data: Partial<ParticipantProps> = {},
): Promise<Participant> {
  const participant = await makeParticipant(data)

  await prisma.participant.create({
    data: PrismaParticipantsMapper.toPrisma(participant),
  })

  return participant
}
