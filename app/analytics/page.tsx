"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Analytics } from "../lib/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#10B981", "#F97316", "#EF4444"];

  const healthData = [
    { name: "Healthy", value: analytics.healthDistribution.healthy },
    { name: "At Risk", value: analytics.healthDistribution.atRisk },
    { name: "Critical", value: analytics.healthDistribution.critical },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="mt-2 text-gray-600">
            Team performance and customer health metrics
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900">
              {analytics.totalCustomers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Contacted This Week</div>
            <div className="text-3xl font-bold text-blue-600">
              {analytics.customersContactedThisWeek}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: Every {analytics.averageContactFrequency} days
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Churn Rate</div>
            <div className="text-3xl font-bold text-red-600">
              {analytics.churnRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.customersAtRisk} at risk
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">NRR</div>
            <div className="text-3xl font-bold text-green-600">
              {analytics.nrr}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ${analytics.expansionRevenueThisMonth.toLocaleString()} expansion this month
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Churn Trend Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Churn Rate Trend (Last 6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.churnTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Churn Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Action Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Impact by Action Type
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueByAction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Distribution Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Health Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Healthy Customers</span>
                <span className="text-lg font-semibold text-green-600">
                  {analytics.healthDistribution.healthy}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">At-Risk Customers</span>
                <span className="text-lg font-semibold text-orange-600">
                  {analytics.healthDistribution.atRisk}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Critical Customers</span>
                <span className="text-lg font-semibold text-red-600">
                  {analytics.healthDistribution.critical}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm text-gray-600">Expansion Opportunities</span>
                <span className="text-lg font-semibold text-blue-600">
                  {analytics.expansionOpportunities}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
