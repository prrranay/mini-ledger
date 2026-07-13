import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";
import { toCents } from "@/lib/currency";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
      ...(type && { type }),
      ...(category && { category }),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
    });

    const total = await prisma.transaction.count({ where });

    return NextResponse.json({
      transactions,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, amount, type, category, notes, date } = body;

    if (!title || !amount || !type || !category || !date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const userId = session.user.id;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        title,
        amount: toCents(parseFloat(amount)),
        type,
        category,
        notes,
        date: new Date(date),
      },
    });

    await logActivity(userId, "TRANSACTION_CREATED", `Added ${type}: ${title}`);

    // Non-blocking email notification
    Promise.resolve().then(async () => {
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      });

      if (settings?.email && ((type === "INCOME" && settings.notifyIncome) || (type === "EXPENSE" && settings.notifyExpense))) {
        await sendEmail({
          to: settings.email,
          subject: `New ${type} Added: ${title}`,
          html: `<p>A new ${type.toLowerCase()} of ${amount} was added for category ${category}.</p>`,
          userId,
        });
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
