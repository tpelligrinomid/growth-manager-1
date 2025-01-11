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
  SOCIAL = 'SOCIAL',
  WEBSITE = 'WEBSITE',
  SEO = 'SEO',
  PPC = 'PPC',
  EMAIL = 'EMAIL',
  CONTENT = 'CONTENT'
}

export interface AccountResponse {
  id: string;
  accountName: string;
  businessUnit: BusinessUnit;
  engagementType: EngagementType;
  priority: Priority;
  accountManager: string;
  teamManager: string;
  relationshipStartDate: string;
  contractStartDate: string;
  contractRenewalEnd: string;
  services: Service[];
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
  goals?: any[];
  notes?: any[];
  clientTenure?: number;
  pointsBalance?: number;
} 