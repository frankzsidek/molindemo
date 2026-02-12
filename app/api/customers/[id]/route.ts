import { NextRequest, NextResponse } from "next/server";
import { mockCustomers } from "@/app/lib/mockData";
import { enrichCustomer } from "@/app/lib/calculations";
import type { Customer } from "@/app/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const customer = mockCustomers.find((c) => c.customerId === id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const enrichedCustomer = enrichCustomer(customer);

    return NextResponse.json({
      success: true,
      customer: enrichedCustomer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await request.json();

    const customerIndex = mockCustomers.findIndex((c) => c.customerId === id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update the customer with new data
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...updates,
    };

    // Return the updated customer with recalculated scores
    const enrichedCustomer = enrichCustomer(mockCustomers[customerIndex]);

    return NextResponse.json({
      success: true,
      customer: enrichedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}
