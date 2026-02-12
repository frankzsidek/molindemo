"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { CustomerWithScores } from "@/app/lib/types";

interface CustomerCardProps {
  customer: CustomerWithScores;
  type: "churn" | "expansion";
  onScheduleCheckIn?: (customer: CustomerWithScores) => void;
  onScheduleUpgrade?: (customer: CustomerWithScores) => void;
  onSendFeatureDemo?: (customer: CustomerWithScores) => void;
  onMarkContacted?: (customer: CustomerWithScores) => void;
}

export default function CustomerCard({
  customer,
  type,
  onScheduleCheckIn,
  onScheduleUpgrade,
  onSendFeatureDemo,
  onMarkContacted,
}: CustomerCardProps) {
  const borderColor = type === "churn" ? "border-l-red-500" : "border-l-green-500";
  const badgeColor =
    type === "churn"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";

  return (
    <div
      className={`bg-white rounded-lg border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-all p-4 mb-4`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Link
            href={`/customers/${customer.customerId}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {customer.companyName}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${badgeColor} font-medium`}>
              {customer.currentTier}
            </span>
            <span className="text-sm text-gray-600">
              ${customer.monthlyRecurringRevenue}/mo
            </span>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold ${
              type === "churn" ? "text-red-600" : "text-green-600"
            }`}
          >
            {customer.daysSinceLogin}
          </div>
          <div className="text-xs text-gray-500">
            {type === "churn" ? "days inactive" : "days ago"}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-3 space-y-1">
        {type === "churn" ? (
          <>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Last contact:</span>{" "}
              {formatDistanceToNow(new Date(customer.lastCSMContactDate), {
                addSuffix: true,
              })}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Risk reason:</span>{" "}
              {customer.daysSinceLogin >= 45
                ? `Inactive ${customer.daysSinceLogin} days`
                : customer.daysSinceLogin >= 30
                ? "No login activity"
                : "Multiple risk factors"}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Usage:</span>{" "}
              <span className="font-semibold text-green-600">
                {Math.round(customer.usagePercentage)}%
              </span>{" "}
              ({customer.conversationsUsedThisMonth.toLocaleString()}/
              {customer.monthlyConversationLimit.toLocaleString()} conversations)
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Revenue uplift:</span>{" "}
              <span className="font-semibold text-green-600">
                +$
                {(
                  customer.potentialMRRIfUpgraded - customer.monthlyRecurringRevenue
                ).toFixed(0)}
                /mo
              </span>
            </div>
            {customer.featuresNotUsed.length > 0 && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Unused features:</span>{" "}
                {customer.featuresNotUsed.slice(0, 2).join(", ")}
                {customer.featuresNotUsed.length > 2 && `, +${customer.featuresNotUsed.length - 2} more`}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {type === "churn" ? (
          <>
            <button
              onClick={() => onScheduleCheckIn?.(customer)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
            >
              Schedule Check-in
            </button>
            <button
              onClick={() => onMarkContacted?.(customer)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors"
            >
              Mark as Contacted
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onScheduleUpgrade?.(customer)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
            >
              Schedule Upgrade Call
            </button>
            <button
              onClick={() => onSendFeatureDemo?.(customer)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors"
            >
              Send Feature Demo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
