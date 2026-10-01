import { PrismaTripsRepository } from '@/infra/database/prisma/repositories/prisma-trips-repository'
import { PrismaParticipantsRepository } from '@/infra/database/prisma/repositories/prisma-participants-repository'
import { PrismaTravelersRepository } from '@/infra/database/prisma/repositories/prisma-travelers-repository'
import { NodemailerMailer } from '@/infra/mail/nodemailer-mailer'
import { CreateInviteUseCase } from '../create-invite'

export async function createInviteFactory() {
  const tripsRepository = new PrismaTripsRepository()
  const participantsRepository = new PrismaParticipantsRepository()
  const travelersRepository = new PrismaTravelersRepository()
  const mailer = await NodemailerMailer.create()
  const createInviteUseCase = new CreateInviteUseCase(
    tripsRepository,
    participantsRepository,
    travelersRepository,
    mailer,
  )

  return createInviteUseCase
}
