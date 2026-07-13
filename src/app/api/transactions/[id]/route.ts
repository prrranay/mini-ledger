import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { toCents } from "@/lib/currency";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { title, amount, type, category, notes, date } = body;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        title,
        amount: toCents(parseFloat(amount)),
        type,
        category,
        notes,
        date: new Date(date),
      },
    });

    await logActivity(session.user.id, "TRANSACTION_UPDATED", `Updated ${type}: ${title}`);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    await logActivity(session.user.id, "TRANSACTION_DELETED", `Deleted transaction: ${existingTransaction.title}`);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TRANSACTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
