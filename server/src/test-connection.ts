import { PrismaClient } from '@prisma/client'

async function main() {
  // Force the external URL if it exists
  const externalUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL
  
  console.log('Using Database URL:', externalUrl?.replace(/:[^:@]+@/, ':****@'))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: externalUrl
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