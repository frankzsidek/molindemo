import { NextRequest, NextResponse } from "next/server";
import { mockCustomers } from "@/app/lib/mockData";
import { enrichCustomer } from "@/app/lib/calculations";
import { getAllTemplatesForCustomer } from "@/app/lib/emailTemplates";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const templateType = searchParams.get("type");
    const csmName = searchParams.get("csmName") || "Your CSM";

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required" },
        { status: 400 }
      );
    }

    const customer = mockCustomers.find((c) => c.customerId === customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const enrichedCustomer = enrichCustomer(customer);
    const templates = getAllTemplatesForCustomer(enrichedCustomer, csmName);

    // If specific template type requested, return only that
    if (templateType) {
      const template = templates[templateType as keyof typeof templates];
      if (!template) {
        return NextResponse.json(
          { success: false, error: "Invalid template type" },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        template,
      });
    }

    // Otherwise return all templates
    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Error generating email templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate email templates" },
      { status: 500 }
    );
  }
}
