"use client";

import { useState, useMemo } from "react";
import { useCustomers } from "./context/CustomerContext";
import ChurnRiskColumn from "./components/ChurnRiskColumn";
import ExpansionColumn from "./components/ExpansionColumn";
import EmailTemplateModal from "./components/EmailTemplateModal";
import { generateCheckInTemplate, generateUpgradeTemplate, generateFeatureDemoTemplate } from "./lib/emailTemplates";
import type { CustomerWithScores, EmailTemplate } from "./lib/types";

export default function Home() {
  const { customers, loading, error } = useCustomers();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [currentCustomerName, setCurrentCustomerName] = useState("");

  // Filter customers for churn risk (at-risk or critical health status) and sorting
  const churnRiskCustomers = useMemo(() => {
    return customers
      .filter((c) => c.accountHealth === "at-risk" || c.accountHealth === "critical")
      .sort((a, b) => b.churnRiskScore - a.churnRiskScore)
      .slice(0, 15); // Show top 15 at-risk customers
  }, [customers]);

  // Filter customers for expansion (score >= 0.3) and sorting
  const expansionCustomers = useMemo(() => {
    return customers
      .filter((c) => c.expansionScore >= 0.3)
      .sort((a, b) => b.expansionScore - a.expansionScore)
      .slice(0, 15); // Show top 15 expansion opportunities
  }, [customers]);

  const handleScheduleCheckIn = (customer: CustomerWithScores) => {
    const template = generateCheckInTemplate(customer);
    setCurrentTemplate(template);
    setCurrentCustomerName(customer.companyName);
    setModalOpen(true);
  };

  const handleScheduleUpgrade = (customer: CustomerWithScores) => {
    const template = generateUpgradeTemplate(customer);
    setCurrentTemplate(template);
    setCurrentCustomerName(customer.companyName);
    setModalOpen(true);
  };

  const handleSendFeatureDemo = (customer: CustomerWithScores) => {
    const template = generateFeatureDemoTemplate(customer);
    setCurrentTemplate(template);
    setCurrentCustomerName(customer.companyName);
    setModalOpen(true);
  };

  const handleMarkContacted = async (customer: CustomerWithScores) => {
    try {
      const response = await fetch(
        `/api/customers/${customer.customerId}/mark-contacted`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "Marked as contacted from dashboard" }),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(`Marked ${customer.companyName} as contacted!`);
      }
    } catch (err) {
      console.error("Error marking customer as contacted:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Daily priority list: {churnRiskCustomers.length} churn risks and{" "}
            {expansionCustomers.length} expansion opportunities
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChurnRiskColumn
            customers={churnRiskCustomers}
            onScheduleCheckIn={handleScheduleCheckIn}
            onMarkContacted={handleMarkContacted}
          />
          <ExpansionColumn
            customers={expansionCustomers}
            onScheduleUpgrade={handleScheduleUpgrade}
            onSendFeatureDemo={handleSendFeatureDemo}
          />
        </div>
      </div>

      {/* Email Template Modal */}
      {currentTemplate && (
        <EmailTemplateModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          template={currentTemplate}
          customerName={currentCustomerName}
        />
      )}
    </div>
  );
}
