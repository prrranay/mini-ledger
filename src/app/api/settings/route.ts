import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          email: session.user.email,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email, notifyIncome, notifyExpense } = body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: {
        email,
        notifyIncome,
        notifyExpense,
      },
      create: {
        userId: session.user.id,
        email,
        notifyIncome,
        notifyExpense,
      },
    });

    await logActivity(session.user.id, "SETTINGS_UPDATED", "Updated notification settings.");

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
