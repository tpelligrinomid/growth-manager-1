import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
})

async function main() {
  try {
    console.log('Attempting database connection...')
    const result = await prisma.$connect()
    console.log('Connection successful!')
    
    // Try a simple query
    const test = await prisma.$queryRaw`SELECT NOW();`
    console.log('Query result:', test)
    
  } catch (error) {
    console.error('Detailed connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 