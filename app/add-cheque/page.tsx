"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Calendar,
  Landmark,
  MessageCircle,
  Check,
} from "lucide-react";
import { getClearingDate, suppliers } from "@/lib/data";
import { addCheque } from "@/lib/store";
import { cn } from "@/lib/utils";

const banks = [
  "Absa Bank Ghana",
  "GT Bank Ghana",
  "Stanbic Bank Ghana",
  "Ecobank Ghana",
  "Zenith Bank Ghana",
  "Access Bank Ghana",
  "Standard Chartered Bank Ghana",
  "Barclays Bank Ghana",
  "CAL Bank Ghana",
  "First National Bank Ghana",
  "Fidelity Bank Ghana",
  "Universal Merchant Bank Ghana",
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = [2026, 2027, 2028];

export default function AddChequePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [chequeNo, setChequeNo] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [day, setDay] = useState<number>(new Date().getDate());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(2026);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const issueDate = new Date(year, month, day);
      const clearingDate = getClearingDate(issueDate);
      const supplier = suppliers.find((s) => s.id === supplierId);

      if (!supplier) return;

      await addCheque({
        chequeNo,
        supplier: supplier.name,
        supplierId,
        amount: parseFloat(amount),
        bank,
        issueDate,
        clearingDate,
        status: "pending",
      });

      setShowSuccess(true);

      // Simulate WhatsApp notification
      if (sendWhatsApp) {
        console.log("[v0] WhatsApp notification would be sent to manager");
      }

      // Redirect after delay
      setTimeout(() => {
        router.push("/ledger");
      }, 1500);
    } catch (error) {
      console.error("[v0] Error adding cheque:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = chequeNo && supplierId && amount && bank;

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Cheque Added Successfully
          </h2>
          <p className="mt-2 text-muted-foreground">
            {sendWhatsApp && "WhatsApp notification sent to manager. "}
            Redirecting to ledger...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ledger">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Ledger</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              Add New Cheque
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Record a new supplier cheque
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col gap-6">
            {/* Cheque Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Cheque Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="chequeNo">Cheque Number</Label>
                  <Input
                    id="chequeNo"
                    placeholder="e.g., CHQ-011"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (GH₵)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Supplier & Bank Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  Supplier & Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSupplier && (
                    <p className="text-xs text-muted-foreground">
                      Current debt: GH₵{" "}
                      {new Intl.NumberFormat("en-GH", {
                        maximumFractionDigits: 0,
                      }).format(selectedSupplier.totalDebt)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Bank</Label>
                  <Select value={bank} onValueChange={setBank}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b} value={b}>
                          <div className="flex items-center gap-2">
                            <Landmark className="h-4 w-4" />
                            {b}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issue Date Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Issue Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select
                      value={String(day)}
                      onValueChange={(v) => setDay(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-2">
                    <Label>Month</Label>
                    <Select
                      value={String(month)}
                      onValueChange={(v) => setMonth(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m, i) => (
                          <SelectItem key={m} value={String(i)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={String(year)}
                      onValueChange={(v) => setYear(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected:{" "}
                  <span className="font-medium text-foreground">
                    {new Date(year, month, day).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
                <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Cheques clear on the next working day (weekends excluded).
                </p>
              </CardContent>
            </Card>

            {/* Notification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <MessageCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Send WhatsApp Notification
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Notify manager when cheque is saved
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sendWhatsApp}
                    onCheckedChange={setSendWhatsApp}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Add Cheque
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
