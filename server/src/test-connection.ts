import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
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