"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ExpenseItem {
  description: string;
  amount: number;
}

interface DailyReport {
  id: string;
  report_date: string;
  system_sales: number;
  cash_at_hand: number;
  total_expenses: number;
  variance: number;
}

const todayISO = () => new Date().toISOString().split("T")[0];

export default function ReportsPage() {
  const [reportDate, setReportDate] = useState(todayISO());
  const [systemSales, setSystemSales] = useState<number>(0);
  const [cashAtHand, setCashAtHand] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { description: "", amount: 0 },
  ]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [expenses],
  );
  const variance = useMemo(
    () => cashAtHand + totalExpenses - systemSales,
    [cashAtHand, totalExpenses, systemSales],
  );

  const varianceLabel = variance < 0 ? "Shortage" : variance > 0 ? "Overage" : "Balanced";

  const loadReports = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const fromDate = sevenDaysAgo.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_reports")
      .select("id, report_date, system_sales, cash_at_hand, total_expenses, variance")
      .gte("report_date", fromDate)
      .order("report_date", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setReports([]);
      setIsLoading(false);
      return;
    }

    setReports(
      (data ?? []).map((row) => ({
        id: String(row.id),
        report_date: String(row.report_date),
        system_sales: Number(row.system_sales ?? 0),
        cash_at_hand: Number(row.cash_at_hand ?? 0),
        total_expenses: Number(row.total_expenses ?? 0),
        variance: Number(row.variance ?? 0),
      })),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const updateExpense = (
    index: number,
    field: keyof ExpenseItem,
    value: string | number,
  ) => {
    setExpenses((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value }
          : item,
      ),
    );
  };

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { description: "", amount: 0 }]);
  };

  const removeExpenseRow = (index: number) => {
    setExpenses((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    const cleanedExpenses = expenses
      .map((item) => ({
        description: item.description.trim(),
        amount: Number(item.amount) || 0,
      }))
      .filter((item) => item.description.length > 0 || item.amount > 0);

    const payload = {
      report_date: reportDate,
      system_sales: systemSales,
      cash_at_hand: cashAtHand,
      expenses: cleanedExpenses,
      total_expenses: totalExpenses,
      variance,
    };

    const { error } = await supabase.from("daily_reports").insert([payload]);

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setSystemSales(0);
    setCashAtHand(0);
    setExpenses([{ description: "", amount: 0 }]);
    setReportDate(todayISO());
    setIsSaving(false);
    await loadReports();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
            Daily Sales Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture daily totals and track shortages or overages.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="report-date">Date</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-sales">System Sales (GH₵)</Label>
                <Input
                  id="system-sales"
                  type="number"
                  min="0"
                  value={systemSales}
                  onChange={(e) => setSystemSales(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cash-at-hand">Cash at Hand (GH₵)</Label>
                <Input
                  id="cash-at-hand"
                  type="number"
                  min="0"
                  value={cashAtHand}
                  onChange={(e) => setCashAtHand(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Expenses</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExpenseRow}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Expense
                </Button>
              </div>
              <div className="space-y-2">
                {expenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <Input
                      className="col-span-7"
                      placeholder="Description"
                      value={expense.description}
                      onChange={(e) =>
                        updateExpense(index, "description", e.target.value)
                      }
                    />
                    <Input
                      className="col-span-4"
                      type="number"
                      min="0"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) => updateExpense(index, "amount", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-span-1"
                      onClick={() => removeExpenseRow(index)}
                      disabled={expenses.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Expenses</span>
                <span className="text-base font-semibold">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Variance (Cash + Expenses - Sales)
                </span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    variance < 0 ? "text-destructive" : "text-success",
                  )}
                >
                  {varianceLabel}: {formatCurrency(Math.abs(variance))}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Daily Report"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No reports yet. Save your first daily report to start tracking history.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2">Date</th>
                      <th className="py-2">System Sales</th>
                      <th className="py-2">Cash at Hand</th>
                      <th className="py-2">Expenses</th>
                      <th className="py-2">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-border/60">
                        <td className="py-2">{report.report_date}</td>
                        <td className="py-2">{formatCurrency(report.system_sales)}</td>
                        <td className="py-2">{formatCurrency(report.cash_at_hand)}</td>
                        <td className="py-2">{formatCurrency(report.total_expenses)}</td>
                        <td
                          className={cn(
                            "py-2 font-semibold",
                            report.variance < 0 ? "text-destructive" : "text-success",
                          )}
                        >
                          {report.variance < 0 ? "Shortage" : report.variance > 0 ? "Overage" : "Balanced"}{" "}
                          {formatCurrency(Math.abs(report.variance))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
