import { differenceInDays } from "date-fns";
import type { Customer, CustomerWithScores } from "./types";

/**
 * Calculate days since a given date
 */
export function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return differenceInDays(now, date);
}

/**
 * Calculate churn risk score (0-1 scale, higher = more risk)
 * Formula: (daysSinceLogin * 0.4) + (negativeTickets * 0.3) + (lowUsagePercentage * 0.3)
 */
export function calculateChurnRiskScore(customer: Customer): number {
  const daysSinceLogin = daysSince(customer.lastLoginDate);
  const usagePercentage =
    (customer.conversationsUsedThisMonth / customer.monthlyConversationLimit) *
    100;

  // Normalize days_since_login (0-60 days -> 0-1 scale)
  const daysFactor = Math.min(daysSinceLogin / 60, 1) * 0.4;

  // Negative tickets factor (0-5 tickets -> 0-1 scale)
  const negativeTicketsFactor =
    customer.customerSentiment === "negative"
      ? Math.min(customer.supportTicketsLastMonth / 5, 1) * 0.3
      : customer.supportTicketsLastMonth > 3
      ? 0.15
      : 0;

  // Low usage factor (inverse of usage percentage)
  const lowUsagePercentage = Math.max(0, 100 - usagePercentage) / 100;
  const lowUsageFactor = lowUsagePercentage * 0.3;

  const churnRisk = daysFactor + negativeTicketsFactor + lowUsageFactor;

  // Return normalized score between 0 and 1
  return Math.min(Math.max(churnRisk, 0), 1);
}

/**
 * Calculate expansion opportunity score (0-1 scale, higher = better opportunity)
 * Formula: (usagePercentage * 0.4) + (revenueUpside * 0.4) + (unusedFeatures * 0.2)
 */
export function calculateExpansionScore(customer: Customer): number {
  const usagePercentage =
    (customer.conversationsUsedThisMonth / customer.monthlyConversationLimit) *
    100;

  // Usage factor (80%+ usage is good)
  const usageFactor = Math.min((Math.max(usagePercentage - 50, 0) / 50) * 1, 1) * 0.4;

  // Revenue upside factor (normalized by potential uplift)
  const potentialMRR = calculatePotentialMRR(customer);
  const revenueUpside = potentialMRR - customer.monthlyRecurringRevenue;
  const revenueFactor = Math.min(revenueUpside / 300, 1) * 0.4;

  // Unused features factor (more unused = more opportunity)
  const unusedFeaturesFactor = (customer.featuresNotUsed.length / 5) * 0.2;

  const expansionScore = usageFactor + revenueFactor + unusedFeaturesFactor;

  // Return normalized score between 0 and 1
  return Math.min(Math.max(expansionScore, 0), 1);
}

/**
 * Calculate potential MRR if customer upgrades to next tier
 */
export function calculatePotentialMRR(customer: Customer): number {
  const currentMRR = customer.monthlyRecurringRevenue;

  // Tier upgrade pricing (simplified)
  switch (customer.currentTier) {
    case "Startup":
      return 55; // Growth tier
    case "Growth":
      return 119; // Scale tier
    case "Scale":
      return 319; // Enterprise tier
    case "Enterprise":
      return currentMRR * 1.5; // 50% increase for enterprise
    default:
      return currentMRR * 2; // Default 2x
  }
}

/**
 * Calculate account health based on churn risk score
 */
export function calculateAccountHealth(churnRiskScore: number): "healthy" | "at-risk" | "critical" {
  if (churnRiskScore >= 0.65) return "critical";
  if (churnRiskScore >= 0.4) return "at-risk";
  return "healthy";
}

/**
 * Enrich customer with calculated scores and additional fields
 */
export function enrichCustomer(customer: Customer): CustomerWithScores {
  const churnRiskScore = calculateChurnRiskScore(customer);
  const expansionScore = calculateExpansionScore(customer);
  const daysSinceLogin = daysSince(customer.lastLoginDate);
  const daysSinceLastContact = daysSince(customer.lastCSMContactDate);
  const usagePercentage =
    (customer.conversationsUsedThisMonth / customer.monthlyConversationLimit) *
    100;
  const accountHealth = calculateAccountHealth(churnRiskScore);
  const potentialMRRIfUpgraded = calculatePotentialMRR(customer);

  return {
    ...customer,
    churnRiskScore,
    expansionScore,
    accountHealth,
    totalMRRFromThisCustomer: customer.monthlyRecurringRevenue,
    potentialMRRIfUpgraded,
    daysSinceLogin,
    daysSinceLastContact,
    usagePercentage,
  };
}

/**
 * Sort customers by churn risk (highest risk first)
 */
export function sortByChurnRisk(
  customers: CustomerWithScores[]
): CustomerWithScores[] {
  return [...customers].sort((a, b) => b.churnRiskScore - a.churnRiskScore);
}

/**
 * Sort customers by expansion opportunity (best opportunity first)
 */
export function sortByExpansion(
  customers: CustomerWithScores[]
): CustomerWithScores[] {
  return [...customers].sort((a, b) => b.expansionScore - a.expansionScore);
}

/**
 * Filter customers by churn risk threshold
 */
export function filterAtRisk(
  customers: CustomerWithScores[],
  threshold: number = 0.5
): CustomerWithScores[] {
  return customers.filter((c) => c.churnRiskScore >= threshold);
}

/**
 * Filter customers by expansion opportunity threshold
 */
export function filterExpansionOpportunities(
  customers: CustomerWithScores[],
  threshold: number = 0.3
): CustomerWithScores[] {
  return customers.filter((c) => c.expansionScore >= threshold);
}

/**
 * Get top N churn risk customers
 */
export function getTopChurnRisks(
  customers: CustomerWithScores[],
  count: number = 10
): CustomerWithScores[] {
  return sortByChurnRisk(customers).slice(0, count);
}

/**
 * Get top N expansion opportunities
 */
export function getTopExpansionOpportunities(
  customers: CustomerWithScores[],
  count: number = 10
): CustomerWithScores[] {
  return sortByExpansion(customers).slice(0, count);
}

/**
 * Calculate aggregate MRR from a list of customers
 */
export function calculateTotalMRR(customers: Customer[]): number {
  return customers.reduce((sum, c) => sum + c.monthlyRecurringRevenue, 0);
}

/**
 * Calculate average usage across customers
 */
export function calculateAverageUsage(
  customers: CustomerWithScores[]
): number {
  if (customers.length === 0) return 0;
  const total = customers.reduce((sum, c) => sum + c.usagePercentage, 0);
  return total / customers.length;
}

/**
 * Get churn reason text for a customer
 */
export function getChurnReason(customer: CustomerWithScores): string {
  if (customer.daysSinceLogin >= 45) {
    return `Inactive ${customer.daysSinceLogin} days`;
  }
  if (customer.daysSinceLogin >= 30) {
    return `Not logged in for ${customer.daysSinceLogin} days`;
  }
  if (customer.customerSentiment === "negative") {
    return "Negative sentiment in recent tickets";
  }
  if (customer.usagePercentage < 30) {
    return `Low usage (${Math.round(customer.usagePercentage)}%)`;
  }
  return "Multiple churn risk factors";
}

/**
 * Get expansion reason text for a customer
 */
export function getExpansionReason(customer: CustomerWithScores): string {
  if (customer.usagePercentage >= 80) {
    return `Using ${Math.round(customer.usagePercentage)}% of monthly limit`;
  }
  if (customer.featuresNotUsed.length >= 3) {
    return `${customer.featuresNotUsed.length} unused features available`;
  }
  const revenueUpside =
    customer.potentialMRRIfUpgraded - customer.monthlyRecurringRevenue;
  if (revenueUpside >= 100) {
    return `+$${revenueUpside}/mo revenue potential`;
  }
  return "Ready for tier upgrade";
}
