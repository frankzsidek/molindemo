"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { CustomerWithScores } from "@/app/lib/types";
import EditableMetrics from "@/app/components/EditableMetrics";

type Tab = "overview" | "usage" | "communication" | "notes" | "actions";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [customer, setCustomer] = useState<CustomerWithScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const response = await fetch(`/api/customers/${id}`);
        const data = await response.json();
        if (data.success) {
          setCustomer(data.customer);
        } else {
          setError(data.error);
        }
      } catch {
        setError("Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [id]);

  const refetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();
      if (data.success) {
        setCustomer(data.customer);
      }
    } catch (err) {
      console.error("Failed to refetch customer:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error || "Customer not found"}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const healthColors = {
    healthy: "bg-green-100 text-green-800",
    "at-risk": "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Customer Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {customer.companyName}
              </h1>
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {customer.currentTier}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    healthColors[customer.accountHealth]
                  }`}
                >
                  {customer.accountHealth.replace("-", " ").toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">MRR:</span>{" "}
                  <span className="font-semibold">${customer.monthlyRecurringRevenue}/mo</span>
                </div>
                <div>
                  <span className="text-gray-500">Industry:</span>{" "}
                  <span className="font-semibold">{customer.industry}</span>
                </div>
                <div>
                  <span className="text-gray-500">Team Size:</span>{" "}
                  <span className="font-semibold">{customer.numberOfTeamMembers} members</span>
                </div>
                <div>
                  <span className="text-gray-500">Country:</span>{" "}
                  <span className="font-semibold">{customer.country}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Churn Risk</div>
              <div className="text-3xl font-bold text-red-600">
                {Math.round(customer.churnRiskScore * 100)}%
              </div>
              <div className="text-sm text-gray-500 mt-3 mb-1">Expansion Score</div>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(customer.expansionScore * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "overview", label: "Overview" },
                { id: "usage", label: "Usage Analytics" },
                { id: "communication", label: "Communication History" },
                { id: "notes", label: "Notes & Tasks" },
                { id: "actions", label: "Suggested Actions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Editable Metrics Section */}
                <EditableMetrics customer={customer} onUpdate={refetchCustomer} />

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Customer ID:</dt>
                        <dd className="font-mono text-gray-900">{customer.customerId}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Signup Date:</dt>
                        <dd className="text-gray-900">
                          {new Date(customer.signupDate).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Last Login:</dt>
                        <dd className="text-gray-900">
                          {formatDistanceToNow(new Date(customer.lastLoginDate), {
                            addSuffix: true,
                          })}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Language:</dt>
                        <dd className="text-gray-900 uppercase">{customer.language}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Usage Summary</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Conversations Used:</dt>
                        <dd className="text-gray-900">
                          {customer.conversationsUsedThisMonth.toLocaleString()} /{" "}
                          {customer.monthlyConversationLimit.toLocaleString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Usage Percentage:</dt>
                        <dd className="font-semibold text-gray-900">
                          {Math.round(customer.usagePercentage)}%
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Support Tickets:</dt>
                        <dd className="text-gray-900">{customer.supportTicketsLastMonth}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Sentiment:</dt>
                        <dd className="text-gray-900 capitalize">{customer.customerSentiment}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Active Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.featuresUsed.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-500 mb-2">Unused Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {customer.featuresNotUsed.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Usage Analytics */}
            {activeTab === "usage" && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 text-lg">Conversation Usage Trend</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-end h-48">
                    {customer.conversationTrend.map((usage, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{
                            height: `${(usage / Math.max(...customer.conversationTrend)) * 150}px`,
                          }}
                        ></div>
                        <div className="mt-2 text-sm text-gray-600">
                          Month {index - customer.conversationTrend.length + 1}
                        </div>
                        <div className="text-xs font-semibold text-gray-900">{usage}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(customer.usagePercentage)}%
                    </div>
                    <div className="text-sm text-gray-600">Current Usage</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {customer.conversationsUsedThisMonth.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Conversations This Month</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {customer.monthlyConversationLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Limit</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Communication History */}
            {activeTab === "communication" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Recent Contacts</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Last CSM Contact:{" "}
                    {formatDistanceToNow(new Date(customer.lastCSMContactDate), {
                      addSuffix: true,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Communication history would appear here in a production app.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Notes & Tasks */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Notes & Tasks</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    No notes or tasks yet. Add your first note or task to get started.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Suggested Actions */}
            {activeTab === "actions" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Suggested Next Steps</h3>
                <div className="space-y-3">
                  {customer.churnRiskScore >= 0.5 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                      <p className="font-semibold text-red-800">High Churn Risk Detected</p>
                      <p className="text-sm text-red-700 mt-1">
                        Customer hasn&apos;t logged in for {customer.daysSinceLogin} days. Schedule a check-in call today.
                      </p>
                    </div>
                  )}
                  {customer.usagePercentage >= 80 && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                      <p className="font-semibold text-green-800">Upgrade Opportunity</p>
                      <p className="text-sm text-green-700 mt-1">
                        Customer is using {Math.round(customer.usagePercentage)}% of their limit. Suggest upgrading to {" "}
                        the next tier (+${customer.potentialMRRIfUpgraded - customer.monthlyRecurringRevenue}/mo).
                      </p>
                    </div>
                  )}
                  {customer.featuresNotUsed.length > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                      <p className="font-semibold text-blue-800">Feature Adoption Opportunity</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Customer hasn&apos;t tried: {customer.featuresNotUsed.join(", ")}. Send a feature demo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
