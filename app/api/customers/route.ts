import { NextRequest, NextResponse } from "next/server";
import { mockCustomers } from "@/app/lib/mockData";
import {
  enrichCustomer,
  sortByChurnRisk,
  sortByExpansion,
  filterAtRisk,
  filterExpansionOpportunities,
} from "@/app/lib/calculations";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort");
    const filter = searchParams.get("filter");

    // Enrich all customers with calculated scores
    let customers = mockCustomers.map((customer) => enrichCustomer(customer));

    // Apply filters
    if (filter === "at-risk") {
      customers = filterAtRisk(customers, 0.5);
    } else if (filter === "expansion") {
      customers = filterExpansionOpportunities(customers, 0.3);
    } else if (filter === "healthy") {
      customers = customers.filter((c) => c.accountHealth === "healthy");
    }

    // Apply sorting
    if (sort === "risk") {
      customers = sortByChurnRisk(customers);
    } else if (sort === "expansion") {
      customers = sortByExpansion(customers);
    }

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
