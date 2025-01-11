import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    await prisma.clientContact.deleteMany();
    await prisma.note.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.account.deleteMany();

    // Create a single test account
    const account = await prisma.account.create({
      data: {
        accountName: "Tech Innovators Inc",
        businessUnit: "NEW_NORTH",
        engagementType: "STRATEGIC",
        priority: "TIER_1",
        accountManager: "John Smith",
        teamManager: "Sarah Johnson",
        relationshipStartDate: new Date('2023-01-01'),
        contractStartDate: new Date('2023-01-15'),
        contractRenewalEnd: new Date('2024-01-15'),
        services: ["ABM", "CONTENT", "SEO"],
        pointsPurchased: 1000,
        pointsDelivered: 400,
        delivery: "On Track",
        recurringPointsAllotment: 100,
        mrr: 15000,
        growthInMrr: 2000,
        potentialMrr: 20000,
        website: "https://techinnovators.com",
        linkedinProfile: "https://linkedin.com/company/techinnovators",
        industry: "Technology",
        annualRevenue: 5000000,
        employees: 250
      }
    });

    // Add a goal
    await prisma.goal.create({
      data: {
        clientId: account.id,
        description: "Increase MRR by 30%",
        status: "In Progress",
        dueDate: new Date('2024-06-30'),
        progress: 45
      }
    });

    // Add a note
    await prisma.note.create({
      data: {
        clientId: account.id,
        description: "Q1 Review completed",
        createdBy: "John Smith",
        createdAt: new Date('2023-03-30')
      }
    });

    // Add a contact
    await prisma.clientContact.create({
      data: {
        clientId: account.id,
        firstName: "Michael",
        lastName: "Chen",
        title: "Marketing Director",
        email: "michael.chen@techinnovators.com"
      }
    });

    console.log('Database seeded!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    await prisma.$disconnect();
    throw error;
  }
}

main(); 