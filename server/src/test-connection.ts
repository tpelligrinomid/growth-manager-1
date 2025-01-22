import { PrismaClient } from '@prisma/client'

async function main() {
  // Log all relevant environment variables
  console.log('Environment variables:')
  console.log('PGHOST:', process.env.PGHOST)
  console.log('PGPORT:', process.env.PGPORT)
  console.log('PGDATABASE:', process.env.PGDATABASE)
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    console.log('Attempting database connection...')
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('Connection successful:', result)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main() 