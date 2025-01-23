export enum BusinessUnit {
  NEW_NORTH = 'NEW_NORTH',
  IDEOMETRY = 'IDEOMETRY',
  MOTION = 'MOTION',
  SPOKE = 'SPOKE'
}

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
  accountName: string;
  businessUnit: string;
  engagementType: string;
  priority: string;
  accountManager: string;
  teamManager: string;
  relationshipStartDate: string;
  contractStartDate: string;
  contractRenewalEnd: string;
  services: string[];
  pointsPurchased: number;
  pointsDelivered: number;
  pointsStrikingDistance: number;
  delivery: string;
  recurringPointsAllotment: number;
  mrr: number;
  growthInMrr: number;
  potentialMrr: number;
  website?: string;
  linkedinProfile?: string;
  industry: string;
  annualRevenue: number;
  employees: number;
  clientFolderId: string;
  clientListTaskId: string;
  clientTenure: number;
  pointsBalance: number;
  points?: any[];
  growthTasks?: any[];
  goals?: any[];
  clientData?: any | null;
  status: string;
} 