import { prisma } from '@/infra/database/prisma/prisma'

async function seed() {}

seed().then(() => {
  prisma.$disconnect()
  console.log('Database seeded!')
})
