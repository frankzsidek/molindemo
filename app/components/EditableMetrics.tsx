"use client";

import { useState } from "react";
import type { CustomerWithScores } from "@/app/lib/types";
import { useCustomers } from "@/app/context/CustomerContext";

interface EditableMetricsProps {
  customer: CustomerWithScores;
  onUpdate?: () => void;
}

export default function EditableMetrics({ customer, onUpdate }: EditableMetricsProps) {
  const { updateCustomer } = useCustomers();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [daysSinceLogin, setDaysSinceLogin] = useState<number>(() => {
    const days = Math.floor((Date.now() - new Date(customer.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  });

  const [conversationsUsed, setConversationsUsed] = useState(customer.conversationsUsedThisMonth);
  const [monthlyLimit, setMonthlyLimit] = useState(customer.monthlyConversationLimit);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Calculate new last login date
      const newLastLoginDate = new Date(Date.now() - (daysSinceLogin * 24 * 60 * 60 * 1000)).toISOString();

      await updateCustomer(customer.customerId, {
        lastLoginDate: newLastLoginDate,
        conversationsUsedThisMonth: conversationsUsed,
        monthlyConversationLimit: monthlyLimit,
      });

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert("Failed to update customer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    const days = Math.floor((Date.now() - new Date(customer.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24));
    setDaysSinceLogin(days);
    setConversationsUsed(customer.conversationsUsedThisMonth);
    setMonthlyLimit(customer.monthlyConversationLimit);
    setIsEditing(false);
  };

  const usagePercentage = (conversationsUsed / monthlyLimit) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900">Editable Metrics</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit Metrics
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm">
        {/* Days Since Last Login */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700 font-medium">Days Since Last Login:</label>
          {isEditing ? (
            <input
              type="number"
              value={daysSinceLogin}
              onChange={(e) => setDaysSinceLogin(Number(e.target.value))}
              min="0"
              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <span className="font-semibold text-gray-900">{daysSinceLogin} days</span>
          )}
        </div>

        {/* Conversations Used */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700 font-medium">Conversations Used:</label>
          {isEditing ? (
            <input
              type="number"
              value={conversationsUsed}
              onChange={(e) => setConversationsUsed(Number(e.target.value))}
              min="0"
              max={monthlyLimit}
              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <span className="font-semibold text-gray-900">{conversationsUsed.toLocaleString()}</span>
          )}
        </div>

        {/* Monthly Limit */}
        <div className="flex justify-between items-center">
          <label className="text-gray-700 font-medium">Monthly Limit:</label>
          {isEditing ? (
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              min="1"
              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <span className="font-semibold text-gray-900">{monthlyLimit.toLocaleString()}</span>
          )}
        </div>

        {/* Usage Percentage */}
        <div className="pt-2 border-t border-blue-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-700 font-medium">Usage:</span>
            <span className={`font-semibold ${usagePercentage >= 80 ? 'text-green-600' : 'text-gray-900'}`}>
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${usagePercentage >= 80 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        {isEditing && (
          <p className="text-xs text-gray-600 italic pt-2">
            Tip: Increase days since login to raise churn risk, or increase usage % to raise expansion score
          </p>
        )}
      </div>
    </div>
  );
}
