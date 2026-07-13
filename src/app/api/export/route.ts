import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { fromCents } from "@/lib/currency";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    await logActivity(session.user.id, "DATA_EXPORTED", `Exported data in ${format.toUpperCase()} format.`);

    if (format === "csv") {
      const header = ["Date", "Title", "Type", "Category", "Amount", "Notes"].join(",");
      const rows = transactions.map(t => 
        [
          t.date.toISOString().split("T")[0],
          `"${t.title.replace(/"/g, '""')}"`,
          t.type,
          t.category,
          fromCents(t.amount),
          `"${(t.notes || "").replace(/"/g, '""')}"`
        ].join(",")
      );
      
      const csv = [header, ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="mini_ledger_export.csv"`,
        },
      });
    }

    return NextResponse.json(transactions, {
      headers: {
        "Content-Disposition": `attachment; filename="mini_ledger_export.json"`,
      }
    });
  } catch (error) {
    console.error("[EXPORT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
