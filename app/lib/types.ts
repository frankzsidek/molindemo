export type CustomerTier = "Free" | "Startup" | "Growth" | "Scale" | "Enterprise";

export type CustomerSentiment = "positive" | "neutral" | "negative";

export type AccountHealth = "healthy" | "at-risk" | "critical";

export type CustomerFeature =
  | "Support AI"
  | "Sales AI"
  | "Lead Gen"
  | "Personalization"
  | "Ninja";

export interface Customer {
  customerId: string;
  companyName: string;
  currentTier: CustomerTier;
  signupDate: string; // ISO date string
  lastLoginDate: string; // ISO date string
  monthlyConversationLimit: number;
  conversationsUsedThisMonth: number;
  conversationTrend: number[]; // Last 3 months
  monthlyRecurringRevenue: number;
  featuresUsed: CustomerFeature[];
  featuresNotUsed: CustomerFeature[];
  supportTicketsLastMonth: number;
  language: string; // ISO language code
  numberOfTeamMembers: number;
  industry: string;
  country: string;
  lastCSMContactDate: string; // ISO date string
  customerSentiment: CustomerSentiment;
  // Calculated fields removed - they'll be in CustomerWithScores only
}

export interface CustomerWithScores extends Customer {
  churnRiskScore: number; // 0-1 scale, calculated
  expansionScore: number; // 0-1 scale, calculated
  accountHealth: AccountHealth; // calculated from churn risk
  totalMRRFromThisCustomer: number; // alias for monthlyRecurringRevenue
  potentialMRRIfUpgraded: number; // calculated based on tier
  daysSinceLogin: number;
  daysSinceLastContact: number;
  usagePercentage: number;
}

export interface Task {
  id: string;
  customerId: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate?: string;
  completed: boolean;
}

export interface Note {
  id: string;
  customerId: string;
  content: string;
  createdAt: string;
  createdBy: string; // CSM name
}

export interface ContactLog {
  id: string;
  customerId: string;
  contactDate: string;
  type: "email" | "call" | "meeting";
  subject: string;
  notes: string;
  csmName: string;
}

export interface Analytics {
  totalCustomers: number;
  customersContactedThisWeek: number;
  averageContactFrequency: number; // Days
  churnRate: number; // Percentage
  nrr?: number; // Net Revenue Retention (optional)
  expansionRevenueThisMonth: number;
  customersAtRisk: number;
  expansionOpportunities: number;
  churnTrend: Array<{ month: string; rate: number }>; // Last 6 months
  revenueByAction: Array<{ action: string; revenue: number }>;
  healthDistribution: {
    healthy: number;
    atRisk: number;
    critical: number;
  };
}

export interface EmailTemplate {
  type: "check-in" | "upgrade" | "feature-demo";
  subject: string;
  body: string;
}

export interface PriorityCustomer {
  customer: CustomerWithScores;
  rank: number;
  reason: string;
  actionNeeded: string;
  timeEstimate: string;
  priority: "critical" | "high" | "medium" | "low";
}
