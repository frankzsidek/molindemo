import { NextResponse } from "next/server";
import { mockCustomers } from "@/app/lib/mockData";
import { enrichCustomer } from "@/app/lib/calculations";
import type { Analytics } from "@/app/lib/types";

export async function GET() {
  try {
    const enrichedCustomers = mockCustomers.map((c) => enrichCustomer(c));

    // Calculate metrics
    const totalCustomers = enrichedCustomers.length;
    const customersContactedThisWeek = 12; // Mock value
    const averageContactFrequency = 14; // Every 14 days

    // Churn rate calculation
    const customersAtRisk = enrichedCustomers.filter(
      (c) => c.accountHealth === "at-risk" || c.accountHealth === "critical"
    ).length;
    const churnRate = ((customersAtRisk / totalCustomers) * 100).toFixed(1);

    // NRR calculation (mock)
    const nrr = 115;

    // Expansion revenue this month
    const expansionOpportunities = enrichedCustomers.filter((c) => c.expansionScore >= 0.3);
    const expansionRevenueThisMonth = expansionOpportunities.reduce(
      (sum, c) => sum + (c.potentialMRRIfUpgraded - c.monthlyRecurringRevenue),
      0
    );

    // Churn trend (last 6 months - mock data)
    const churnTrend = [
      { month: "Aug", rate: 5.2 },
      { month: "Sep", rate: 4.8 },
      { month: "Oct", rate: 5.5 },
      { month: "Nov", rate: 4.9 },
      { month: "Dec", rate: 4.2 },
      { month: "Jan", rate: parseFloat(churnRate) },
    ];

    // Revenue by action type
    const revenueByAction = [
      { action: "Check-ins", revenue: 2400 },
      { action: "Upgrades", revenue: 8900 },
      { action: "Feature Demos", revenue: 3200 },
    ];

    // Health distribution
    const healthDistribution = {
      healthy: enrichedCustomers.filter((c) => c.accountHealth === "healthy").length,
      atRisk: enrichedCustomers.filter((c) => c.accountHealth === "at-risk").length,
      critical: enrichedCustomers.filter((c) => c.accountHealth === "critical").length,
    };

    const analytics: Analytics = {
      totalCustomers,
      customersContactedThisWeek,
      averageContactFrequency,
      churnRate: parseFloat(churnRate),
      nrr,
      expansionRevenueThisMonth: Math.round(expansionRevenueThisMonth),
      customersAtRisk,
      expansionOpportunities: expansionOpportunities.length,
      churnTrend,
      revenueByAction,
      healthDistribution,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate analytics" },
      { status: 500 }
    );
  }
}
