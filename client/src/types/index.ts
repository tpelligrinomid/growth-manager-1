export enum EngagementType {
  STRATEGIC = 'STRATEGIC',
  TACTICAL = 'TACTICAL'
}

export enum Priority {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  TIER_4 = 'TIER_4'
}

export enum Service {
  ABM = 'ABM',
  PAID_MEDIA = 'PAID_MEDIA',
  SEO = 'SEO',
  CONTENT = 'CONTENT',
  REPORTING = 'REPORTING',
  SOCIAL = 'SOCIAL',
  WEBSITE = 'WEBSITE'
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  assignee?: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  accountId: string;
}

export interface AccountResponse {
  id: string;
  // Manual Entry Fields
  engagementType: string;
  priority: string;
  industry: string;
  annualRevenue: number;
  employees: number;
  website?: string;
  linkedinProfile?: string;
  clientFolderId: string;
  clientListTaskId: string;
  growthInMrr: number;
  services: Service[];

  // BigQuery Sourced Fields
  accountName: string;
  businessUnit: string;
  accountManager: string;
  teamManager: string;
  status: string;
  relationshipStartDate: string;
  contractStartDate: string;
  contractRenewalEnd: string;
  pointsPurchased: number;
  pointsDelivered: number;
  recurringPointsAllotment: number;
  mrr: number;

  // Calculated Fields
  clientTenure: number;
  pointsStrikingDistance: number;
  potentialMrr: number;
} 