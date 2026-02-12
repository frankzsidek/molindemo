"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCustomers } from "../context/CustomerContext";
import type { CustomerWithScores } from "../lib/types";

interface PriorityItem {
  rank: number;
  customer: CustomerWithScores;
  reason: string;
  action: string;
  timeEstimate: string;
  priority: "critical" | "high" | "medium";
}

export default function PriorityPage() {
  const { customers, loading, error } = useCustomers();

  const priorityList = useMemo(() => {
    const items: PriorityItem[] = [];

    // Critical churn risk (inactive 45+ days)
    const criticalChurn = customers
      .filter((c) => c.daysSinceLogin >= 45)
      .sort((a, b) => b.daysSinceLogin - a.daysSinceLogin);

    criticalChurn.forEach((customer) => {
      items.push({
        rank: items.length + 1,
        customer,
        reason: `Critical: Inactive ${customer.daysSinceLogin} days`,
        action: "Check-in call",
        timeEstimate: "15 min",
        priority: "critical",
      });
    });

    // High churn risk (inactive 30-44 days)
    const highChurn = customers
      .filter((c) => c.daysSinceLogin >= 30 && c.daysSinceLogin < 45)
      .sort((a, b) => b.churnRiskScore - a.churnRiskScore)
      .slice(0, 5);

    highChurn.forEach((customer) => {
      items.push({
        rank: items.length + 1,
        customer,
        reason: `High risk: Inactive ${customer.daysSinceLogin} days`,
        action: "Check-in call",
        timeEstimate: "15 min",
        priority: "high",
      });
    });

    // High-value expansion (>$100/mo uplift potential)
    const highExpansion = customers
      .filter(
        (c) =>
          c.potentialMRRIfUpgraded - c.monthlyRecurringRevenue >= 100 &&
          c.expansionScore >= 0.5
      )
      .sort((a, b) => {
        const aUplift = a.potentialMRRIfUpgraded - a.monthlyRecurringRevenue;
        const bUplift = b.potentialMRRIfUpgraded - b.monthlyRecurringRevenue;
        return bUplift - aUplift;
      })
      .slice(0, 5);

    highExpansion.forEach((customer) => {
      const uplift =
        customer.potentialMRRIfUpgraded - customer.monthlyRecurringRevenue;
      items.push({
        rank: items.length + 1,
        customer,
        reason: `High value: +$${uplift}/mo potential`,
        action: "Upgrade call",
        timeEstimate: "30 min",
        priority: "high",
      });
    });

    // Medium expansion opportunities
    const mediumExpansion = customers
      .filter(
        (c) =>
          c.expansionScore >= 0.3 &&
          c.expansionScore < 0.5 &&
          c.potentialMRRIfUpgraded - c.monthlyRecurringRevenue < 100
      )
      .sort((a, b) => b.expansionScore - a.expansionScore)
      .slice(0, 5);

    mediumExpansion.forEach((customer) => {
      items.push({
        rank: items.length + 1,
        customer,
        reason: customer.featuresNotUsed.length > 0
          ? `${customer.featuresNotUsed.length} unused features`
          : `${Math.round(customer.usagePercentage)}% usage`,
        action: "Feature demo",
        timeEstimate: "10 min",
        priority: "medium",
      });
    });

    return items.slice(0, 20); // Show top 20 priorities
  }, [customers]);

  const totalEstimatedTime = useMemo(() => {
    return priorityList.reduce((sum, item) => {
      const minutes = parseInt(item.timeEstimate);
      return sum + minutes;
    }, 0);
  }, [priorityList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading priorities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Today&apos;s Priority List
          </h1>
          <p className="mt-2 text-gray-600">
            {priorityList.length} customers to contact | Est. time:{" "}
            {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
          </p>
        </div>

        {/* Priority List */}
        <div className="space-y-3">
          {priorityList.map((item) => {
            const priorityColors = {
              critical: {
                bg: "bg-red-50",
                border: "border-red-500",
                badge: "bg-red-100 text-red-800",
                icon: "text-red-500",
              },
              high: {
                bg: "bg-orange-50",
                border: "border-orange-500",
                badge: "bg-orange-100 text-orange-800",
                icon: "text-orange-500",
              },
              medium: {
                bg: "bg-blue-50",
                border: "border-blue-500",
                badge: "bg-blue-100 text-blue-800",
                icon: "text-blue-500",
              },
            };

            const colors = priorityColors[item.priority];

            return (
              <div
                key={`${item.customer.customerId}-${item.rank}`}
                className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded-r-lg shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Rank */}
                    <div className="shrink-0">
                      <div className={`w-12 h-12 rounded-full ${colors.badge} flex items-center justify-center font-bold text-lg`}>
                        #{item.rank}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/customers/${item.customer.customerId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {item.customer.companyName}
                        </Link>
                        <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {item.customer.currentTier}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${item.customer.monthlyRecurringRevenue}/mo
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Reason:</span> {item.reason}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <span className="font-medium">Action:</span> {item.action}
                        </span>
                        <span>
                          <span className="font-medium">Est. time:</span>{" "}
                          {item.timeEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Start Button */}
                    <div className="shrink-0">
                      <Link
                        href={`/customers/${item.customer.customerId}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors inline-block"
                      >
                        Start Task
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {priorityList.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">
              No priority tasks for today. Great job!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
