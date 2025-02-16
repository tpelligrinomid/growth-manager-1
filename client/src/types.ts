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

export interface Goal {
  id: string;
  task_name: string;
  task_description: string | null;
  status: string;
  progress: number | null;
  assignee: string | null;
  created_date: string;
  due_date: string;
  date_done: string | null;
  created_by: string;
}

export interface AccountResponse {
  id: string;
  accountName: string;
  businessUnit: BusinessUnit;
  engagementType: EngagementType;
  priority: Priority;
  industry: string;
  annualRevenue: number;
  employees: number;
  website?: string;
  linkedinProfile?: string;
  clientFolderId: string;
  clientListTaskId: string;
  growthInMrr: number;
  services: string[];
  accountManager: string;
  teamManager: string;
  relationshipStartDate: string;
  contractStartDate: string;
  contractRenewalEnd: string;
  pointsPurchased: number;
  pointsDelivered: number;
  recurringPointsAllotment: number;
  mrr: number;
  pointsStrikingDistance: number;
  potentialMrr: number;
  delivery: string;
  goals?: Goal[];
}

export interface AddAccountForm {
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
} 