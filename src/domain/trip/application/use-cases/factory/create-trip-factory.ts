import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { CreateTripUseCase } from '../create-trip'
import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { NodemailerMailer } from '@/infra/mail/nodemailer-mailer'

export async function createTripFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const travelersRepository = new PrismaTravelersRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const mailer = await NodemailerMailer.create()
  const createTripUseCase = new CreateTripUseCase(
    tripsRepository,
    travelersRepository,
    participantsRepository,
    mailer,
  )

  return createTripUseCase
}
