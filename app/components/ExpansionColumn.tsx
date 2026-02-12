"use client";

import CustomerCard from "./CustomerCard";
import type { CustomerWithScores } from "@/app/lib/types";

interface ExpansionColumnProps {
  customers: CustomerWithScores[];
  onScheduleUpgrade: (customer: CustomerWithScores) => void;
  onSendFeatureDemo: (customer: CustomerWithScores) => void;
}

export default function ExpansionColumn({
  customers,
  onScheduleUpgrade,
  onSendFeatureDemo,
}: ExpansionColumnProps) {
  const totalPotentialRevenue = customers.reduce(
    (sum, c) => sum + (c.potentialMRRIfUpgraded - c.monthlyRecurringRevenue),
    0
  );

  return (
    <div className="flex-1">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg">
        <div className="flex items-center">
          <div className="shrink-0">
            <svg
              className="h-6 w-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-green-800">
              EXPANSION OPPORTUNITIES
            </h2>
            <p className="text-sm text-green-700">
              {customers.length} opportunity{customers.length !== 1 ? "ies" : ""} •
              ${totalPotentialRevenue.toFixed(0)}/mo potential revenue
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No expansion opportunities identified.</p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerCard
              key={customer.customerId}
              customer={customer}
              type="expansion"
              onScheduleUpgrade={onScheduleUpgrade}
              onSendFeatureDemo={onSendFeatureDemo}
            />
          ))
        )}
      </div>
    </div>
  );
}
