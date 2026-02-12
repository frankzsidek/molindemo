import { NextRequest, NextResponse } from "next/server";
import type { Task } from "@/app/lib/types";

// In-memory storage for tasks (in production, use a database)
const tasks: Task[] = [];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, dueDate } = body;

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: id,
      title,
      description: description || "",
      createdAt: new Date().toISOString(),
      dueDate,
      completed: false,
    };

    tasks.push(newTask);

    return NextResponse.json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const customerTasks = tasks.filter((task) => task.customerId === id);

    return NextResponse.json({
      success: true,
      tasks: customerTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
