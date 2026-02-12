"use client";

import CustomerCard from "./CustomerCard";
import type { CustomerWithScores } from "@/app/lib/types";

interface ChurnRiskColumnProps {
  customers: CustomerWithScores[];
  onScheduleCheckIn: (customer: CustomerWithScores) => void;
  onMarkContacted: (customer: CustomerWithScores) => void;
}

export default function ChurnRiskColumn({
  customers,
  onScheduleCheckIn,
  onMarkContacted,
}: ChurnRiskColumnProps) {
  const totalAtRiskMRR = customers.reduce((sum, c) => sum + c.monthlyRecurringRevenue, 0);

  return (
    <div className="flex-1">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
        <div className="flex items-center">
          <div className="shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-red-800">CHURN RISK ALERTS</h2>
            <p className="text-sm text-red-700">
              {customers.length} customer{customers.length !== 1 ? "s" : ""} at risk • \${totalAtRiskMRR.toFixed(0)}/mo MRR
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No churn risks identified.</p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerCard
              key={customer.customerId}
              customer={customer}
              type="churn"
              onScheduleCheckIn={onScheduleCheckIn}
              onMarkContacted={onMarkContacted}
            />
          ))
        )}
      </div>
    </div>
  );
}
