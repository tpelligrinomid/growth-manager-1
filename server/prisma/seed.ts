import { PrismaClient, BusinessUnit, EngagementType, Priority, Service, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear everything
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.clientContact.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create one user
  const user = await prisma.user.create({
    data: {
      email: 'john.smith@example.com',
      name: 'John Smith',
      googleId: 'google123',
      role: 'GROWTH_MANAGER',
    }
  });

  // Create accounts with goals
  const accounts = [
    {
      accountName: 'Tech Innovators Inc',
      businessUnit: BusinessUnit.NEW_NORTH,
      engagementType: EngagementType.STRATEGIC,
      priority: Priority.TIER_2,
      mrr: 15000,
      growthInMrr: 2000,
      accountManager: 'John Smith',
      goals: [{ description: 'Increase MRR by 20%', progress: 25 }]
    },
    {
      accountName: 'Digital Solutions Co',
      businessUnit: BusinessUnit.IDEOMETRY,
      engagementType: EngagementType.TACTICAL,
      priority: Priority.TIER_1,
      mrr: 25000,
      growthInMrr: 5000,
      accountManager: 'John Smith',
      goals: [{ description: 'Launch new campaign', progress: 75 }]
    },
    {
      accountName: 'Marketing Masters',
      businessUnit: BusinessUnit.MOTION,
      engagementType: EngagementType.STRATEGIC,
      priority: Priority.TIER_1,
      mrr: 20000,
      growthInMrr: 3000,
      accountManager: 'John Smith',
      goals: [{ description: 'Optimize conversion rate', progress: 50 }]
    },
    {
      accountName: 'Growth Gurus',
      businessUnit: BusinessUnit.SPOKE,
      engagementType: EngagementType.TACTICAL,
      priority: Priority.TIER_3,
      mrr: 10000,
      growthInMrr: 1000,
      accountManager: 'John Smith',
      goals: [{ description: 'Expand to new market', progress: 30 }]
    },
    {
      accountName: 'Data Dynamics',
      businessUnit: BusinessUnit.NEW_NORTH,
      engagementType: EngagementType.STRATEGIC,
      priority: Priority.TIER_2,
      mrr: 18000,
      growthInMrr: 2500,
      accountManager: 'John Smith',
      goals: [{ description: 'Implement new analytics', progress: 60 }]
    },
    {
      accountName: 'Cloud Connect',
      businessUnit: BusinessUnit.IDEOMETRY,
      engagementType: EngagementType.TACTICAL,
      priority: Priority.TIER_2,
      mrr: 12000,
      growthInMrr: 1500,
      accountManager: 'John Smith',
      goals: [{ description: 'Improve client retention', progress: 40 }]
    },
    {
      accountName: 'Web Wizards',
      businessUnit: BusinessUnit.MOTION,
      engagementType: EngagementType.STRATEGIC,
      priority: Priority.TIER_1,
      mrr: 22000,
      growthInMrr: 4000,
      accountManager: 'John Smith',
      goals: [{ description: 'Launch product feature', progress: 80 }]
    }
  ];

  // Create each account with its goals
  for (const data of accounts) {
    const account = await prisma.account.create({
      data: {
        accountName: data.accountName,
        businessUnit: data.businessUnit,
        engagementType: data.engagementType,
        priority: data.priority,
        accountManager: data.accountManager,
        teamManager: 'Jane Doe',
        relationshipStartDate: new Date('2023-01-01'),
        contractStartDate: new Date('2023-01-01'),
        contractRenewalEnd: new Date('2024-01-01'),
        services: [Service.CONTENT, Service.SEO],
        pointsPurchased: 1000,
        pointsDelivered: 400,
        delivery: 'ON_TRACK',
        recurringPointsAllotment: 100,
        mrr: data.mrr,
        growthInMrr: data.growthInMrr,
        potentialMrr: data.mrr + data.growthInMrr,
        website: `https://${data.accountName.toLowerCase().replace(/\s+/g, '')}.com`,
        linkedinProfile: `https://linkedin.com/company/${data.accountName.toLowerCase().replace(/\s+/g, '')}`,
        industry: 'Technology',
        annualRevenue: data.mrr * 12,
        employees: 50,
        pointsStrikingDistance: 0
      }
    });

    // Create goals separately
    for (const goal of data.goals) {
      await prisma.goal.create({
        data: {
          accountId: account.id,
          description: goal.description,
          status: 'IN_PROGRESS',
          dueDate: new Date('2024-06-30'),
          progress: goal.progress
        }
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch(e => {
    console.error('Error in seed script:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 