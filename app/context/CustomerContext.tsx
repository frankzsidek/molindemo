"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CustomerWithScores, EmailTemplate } from "@/app/lib/types";

interface CustomerContextType {
  customers: CustomerWithScores[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  selectedCustomer: CustomerWithScores | null;
  setSelectedCustomer: (customer: CustomerWithScores | null) => void;
  updateCustomer: (customerId: string, updates: Partial<CustomerWithScores>) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithScores | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch customers");
      }

      setCustomers(data.customers);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const updateCustomer = async (customerId: string, updates: Partial<CustomerWithScores>) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update customer");
      }

      // Refresh customers to get recalculated scores
      await fetchCustomers();
    } catch (err) {
      console.error("Error updating customer:", err);
      throw err;
    }
  };

  const value = {
    customers,
    loading,
    error,
    refreshCustomers: fetchCustomers,
    selectedCustomer,
    setSelectedCustomer,
    updateCustomer,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
