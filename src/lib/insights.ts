import { Transaction } from "@prisma/client";
import { fromCents } from "./currency";
import { format, subMonths, isSameMonth } from "date-fns";

export type HealthScore = {
  score: number;
  status: "Excellent" | "Good" | "Average" | "Needs Attention";
  recommendations: string[];
};

export function calculateHealthScore(
  currentMonthTransactions: Transaction[],
  previousMonthTransactions: Transaction[]
): HealthScore {
  let score = 50;
  const recommendations: string[] = [];

  const currentIncome = currentMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + fromCents(t.amount), 0);
  const currentExpense = currentMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + fromCents(t.amount), 0);

  const prevIncome = previousMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + fromCents(t.amount), 0);
  const prevExpense = previousMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + fromCents(t.amount), 0);

  const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
  
  if (savingsRate > 20) {
    score += 20;
    recommendations.push(`Great job! You saved ${savingsRate.toFixed(0)}% of your income.`);
  } else if (savingsRate > 0) {
    score += 10;
    recommendations.push(`You have a positive savings rate of ${savingsRate.toFixed(0)}%. Try to reach 20%.`);
  } else {
    score -= 20;
    recommendations.push("You spent more than you earned this month. Review your expenses.");
  }

  if (prevExpense > 0) {
    const expenseChange = ((currentExpense - prevExpense) / prevExpense) * 100;
    if (expenseChange < 0) {
      score += 15;
      recommendations.push(`Your expenses decreased by ${Math.abs(expenseChange).toFixed(0)}% compared to last month.`);
    } else if (expenseChange > 10) {
      score -= 15;
      recommendations.push(`Your expenses increased by ${expenseChange.toFixed(0)}% compared to last month.`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  let status: HealthScore["status"] = "Needs Attention";
  if (score >= 80) status = "Excellent";
  else if (score >= 60) status = "Good";
  else if (score >= 40) status = "Average";

  return { score, status, recommendations };
}

export function generateInsights(transactions: Transaction[]): string[] {
  if (!transactions.length) return ["Start adding transactions to see insights!"];

  const insights: string[] = [];
  const expenses = transactions.filter(t => t.type === "EXPENSE");
  const income = transactions.filter(t => t.type === "INCOME");

  const totalExpense = expenses.reduce((sum, t) => sum + fromCents(t.amount), 0);
  const totalIncome = income.reduce((sum, t) => sum + fromCents(t.amount), 0);

  // Category analysis
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + fromCents(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = (Object.entries(categoryTotals) as [string, number][]).sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0 && totalExpense > 0) {
    const topCategory = sortedCategories[0];
    const percentage = ((topCategory[1] / totalExpense) * 100).toFixed(0);
    insights.push(`You spent ${percentage}% of your expenses on ${topCategory[0]}.`);
  }

  // Savings rate insight
  if (totalIncome > 0) {
    const saved = totalIncome - totalExpense;
    if (saved > 0) {
      const rate = ((saved / totalIncome) * 100).toFixed(0);
      insights.push(`Excellent! Your savings rate is ${rate}%.`);
    } else {
      insights.push(`You are currently spending above your income.`);
    }
  }

  // Largest expense
  if (expenses.length > 0) {
    const largestExpense = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
    insights.push(`Your largest expense was ${largestExpense.title} for ${format(largestExpense.date, 'MMM d')}.`);
  }

  // Daily average
  if (expenses.length > 0) {
    const uniqueDays = new Set(expenses.map(t => format(new Date(t.date), 'yyyy-MM-dd'))).size;
    if (uniqueDays > 0) {
      const dailyAvg = (totalExpense / uniqueDays).toFixed(2);
      insights.push(`Your average daily spending on active days is $${dailyAvg}.`);
    }
  }

  return insights;
}
