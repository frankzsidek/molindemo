import { NextRequest, NextResponse } from "next/server";
import type { ContactLog } from "@/app/lib/types";

// In-memory storage for contact logs (in production, use a database)
const contactLogs: ContactLog[] = [];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { notes, csmName } = body;

    const newLog: ContactLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: id,
      contactDate: new Date().toISOString(),
      type: "email",
      subject: "Customer check-in",
      notes: notes || "Marked as contacted from dashboard",
      csmName: csmName || "CSM Team",
    };

    contactLogs.push(newLog);

    return NextResponse.json({
      success: true,
      message: "Customer marked as contacted",
      log: newLog,
    });
  } catch (error) {
    console.error("Error marking customer as contacted:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark customer as contacted" },
      { status: 500 }
    );
  }
}
