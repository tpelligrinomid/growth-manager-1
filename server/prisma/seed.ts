import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.task.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.note.deleteMany()
  await prisma.clientContact.deleteMany()
  await prisma.account.deleteMany()

  // Create test accounts
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        accountName: "Tech Innovators Inc",
        businessUnit: "NEW_NORTH",
        engagementType: "STRATEGIC",
        priority: "TIER_1",
        accountManager: "John Smith",
        teamManager: "Sarah Johnson",
        relationshipStartDate: new Date("2023-01-01"),
        contractStartDate: new Date("2023-01-15"),
        contractRenewalEnd: new Date("2024-01-15"),
        services: ["WEBSITE", "SEO", "CONTENT"],
        pointsPurchased: 1000,
        pointsDelivered: 750,
        pointsStrikingDistance: 100,
        delivery: "ON_TRACK",
        recurringPointsAllotment: 100,
        mrr: 10000,
        growthInMrr: 1000,
        potentialMrr: 11000,
        website: "https://techinnovators.com",
        linkedinProfile: "https://linkedin.com/company/techinnovators",
        industry: "Technology",
        annualRevenue: 5000000,
        employees: 50,
        goals: {
          create: [
            {
              description: "Increase website traffic by 50%",
              status: "IN_PROGRESS",
              dueDate: new Date("2024-06-30"),
              progress: 65
            }
          ]
        },
        tasks: {
          create: [
            {
              name: "Website Redesign",
              description: "Complete homepage redesign",
              status: "IN_PROGRESS",
              dueDate: new Date("2024-03-01")
            }
          ]
        }
      }
    }),
    prisma.account.create({
      data: {
        accountName: "Global Marketing Solutions",
        businessUnit: "IDEOMETRY",
        engagementType: "TACTICAL",
        priority: "TIER_2",
        accountManager: "Emily Brown",
        teamManager: "Michael Wilson",
        relationshipStartDate: new Date("2023-06-01"),
        contractStartDate: new Date("2023-06-15"),
        contractRenewalEnd: new Date("2024-06-15"),
        services: ["SOCIAL", "PPC", "EMAIL"],
        pointsPurchased: 800,
        pointsDelivered: 600,
        pointsStrikingDistance: 50,
        delivery: "ON_TRACK",
        recurringPointsAllotment: 75,
        mrr: 8000,
        growthInMrr: 500,
        potentialMrr: 8500,
        website: "https://globalmarketing.com",
        linkedinProfile: "https://linkedin.com/company/globalmarketing",
        industry: "Marketing",
        annualRevenue: 3000000,
        employees: 30,
        goals: {
          create: [
            {
              description: "Achieve 20% increase in social media engagement",
              status: "NOT_STARTED",
              dueDate: new Date("2024-12-31"),
              progress: 25
            }
          ]
        }
      }
    })
  ])

  console.log('Seed data created:', accounts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 