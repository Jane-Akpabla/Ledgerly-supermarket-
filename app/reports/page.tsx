"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileText, Share2, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { deleteReport } from "@/lib/store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

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
  expenses?: ExpenseItem[];
}

const todayISO = () => new Date().toISOString().split("T")[0];

export default function ReportsPage() {
  const { toast } = useToast();
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
  const [formOpen, setFormOpen] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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
      .select("id, report_date, system_sales, cash_at_hand, total_expenses, variance, expenses")
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
        expenses: (row.expenses ?? []) as ExpenseItem[],
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
    setFormOpen(false);
    toast({
      title: "Report Saved",
      description: "Your daily report has been saved successfully.",
    });
    await loadReports();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteReport(id);
    setDeleting(null);

    if (result.success) {
      toast({
        title: "Report Deleted",
        description: "The report has been removed.",
      });
      await loadReports();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete report.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = (report: DailyReport) => {
    const dateStr = new Date(report.report_date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const message = `Daily Sales Report - ${dateStr}
System Sales: ${formatCurrency(report.system_sales)}
Cash at Hand: ${formatCurrency(report.cash_at_hand)}
Total Expenses: ${formatCurrency(report.total_expenses)}
Variance: ${report.variance < 0 ? "Shortage" : "Overage"} ${formatCurrency(Math.abs(report.variance))}`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
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
                  No reports yet. Create your first daily report to start tracking history.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedReportId(
                          expandedReportId === report.id ? null : report.id,
                        )
                      }
                      className="w-full px-4 py-3 bg-card hover:bg-secondary/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {new Date(report.report_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sales: {formatCurrency(report.system_sales)} | Cash:{" "}
                            {formatCurrency(report.cash_at_hand)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-sm font-bold",
                              report.variance < 0
                                ? "text-destructive"
                                : "text-success",
                            )}
                          >
                            {report.variance < 0
                              ? "Shortage"
                              : report.variance > 0
                                ? "Overage"
                                : "Balanced"}{" "}
                            {formatCurrency(Math.abs(report.variance))}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 ml-2 transition-transform",
                          expandedReportId === report.id && "rotate-180",
                        )}
                      />
                    </button>

                    {expandedReportId === report.id && (
                      <div className="border-t border-border bg-secondary/30 px-4 py-3 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">System Sales</p>
                            <p className="font-semibold">
                              {formatCurrency(report.system_sales)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cash at Hand</p>
                            <p className="font-semibold">
                              {formatCurrency(report.cash_at_hand)}
                            </p>
                          </div>
                        </div>

                        {report.expenses && report.expenses.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">
                              Expenses Breakdown
                            </p>
                            <div className="bg-card rounded border border-border/50 divide-y divide-border/50">
                              {report.expenses.map((exp, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 flex justify-between items-center text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {exp.description}
                                  </span>
                                  <span className="font-semibold">
                                    {formatCurrency(exp.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsAppShare(report)}
                            className="flex-1"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share via WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(report.id)}
                            disabled={deleting === report.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Collapsible open={formOpen} onOpenChange={setFormOpen}>
          <Card>
            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
              <CollapsibleTrigger className="w-full flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Report
                </CardTitle>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-5 border-t border-border pt-5">
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
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </DashboardLayout>
  );
}
