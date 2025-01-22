import { PrismaClient } from '@prisma/client'

async function main() {
  // Log all environment variables
  console.log('Environment variables:')
  console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD)
  console.log('DATABASE_HOST:', process.env.DATABASE_HOST)
  console.log('DATABASE_PORT:', process.env.DATABASE_PORT)
  console.log('DATABASE_NAME:', process.env.DATABASE_NAME)
  
  // Construct the URL
  const url = `postgresql://postgres:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`
  console.log('Constructed URL:', url.replace(/:[^:@]+@/, ':****@'))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
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