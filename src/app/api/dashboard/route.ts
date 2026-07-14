import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateHealthScore, generateInsights } from "@/lib/insights";
import { fromCents } from "@/lib/currency";
import { subMonths, startOfMonth, endOfMonth, subDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    
    // Fetch all transactions to calculate full balance and overall metrics
    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthTransactions = allTransactions.filter(
      (t) => t.date >= currentMonthStart && t.date <= currentMonthEnd
    );
    
    const previousMonthTransactions = allTransactions.filter(
      (t) => t.date >= previousMonthStart && t.date <= previousMonthEnd
    );

    // Totals
    let balanceCents = 0;
    let incomeCents = 0;
    let expenseCents = 0;

    allTransactions.forEach((t) => {
      if (t.type === "INCOME") {
        balanceCents += t.amount;
        incomeCents += t.amount;
      } else {
        balanceCents -= t.amount;
        expenseCents += t.amount;
      }
    });

    // Monthly Trends for Charts
    // Aggregate by last 30 days
    const thirtyDaysAgo = subDays(now, 30);
    const recentTransactions = allTransactions.filter(t => t.date >= thirtyDaysAgo);
    
    const chartDataMap = new Map();
    recentTransactions.forEach(t => {
      const dateStr = t.date.toISOString().split('T')[0];
      if (!chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
      }
      const dayData = chartDataMap.get(dateStr);
      if (t.type === "INCOME") {
        dayData.income += fromCents(t.amount);
      } else {
        dayData.expense += fromCents(t.amount);
      }
    });
    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Category Distribution (Pie Chart)
    const expensesOnly = allTransactions.filter(t => t.type === "EXPENSE");
    const categoryMap = new Map();
    expensesOnly.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + fromCents(t.amount));
    });
    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // Health Score & Insights
    const healthScore = calculateHealthScore(currentMonthTransactions, previousMonthTransactions);
    const insights = generateInsights(recentTransactions);

    // Recent Activity Log
    const recentActivity = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const userSettings = await prisma.notificationSettings.findUnique({
      where: { userId },
      select: { currency: true },
    });
    const currency = userSettings?.currency || "INR";

    return NextResponse.json({
      balance: fromCents(balanceCents),
      income: fromCents(incomeCents),
      expense: fromCents(expenseCents),
      recentTransactions: allTransactions.slice(0, 5),
      chartData,
      categoryData,
      healthScore,
      insights,
      recentActivity,
      currency,
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
