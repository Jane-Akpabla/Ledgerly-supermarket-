// Mock data for the Ledgerly dashboard

export interface Cheque {
  id: string;
  chequeNo: string;
  supplier: string;
  supplierId: string;
  amount: number;
  bank: string;
  issueDate: Date;
  clearingDate: Date;
  status: "pending" | "cleared" | "bounced" | "stopped";
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  location: string;
  productsSupplied: string[];
  totalDebt: number;
  oldestUnpaidBillDays: number;
  trustScore: number;
}

export interface DailyTotal {
  date: Date;
  amount: number;
  count: number;
}

// Banking clearance rules for Ghana supermarket cheques
export function getClearingDate(issueDate: Date): Date {
  const result = new Date(issueDate);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();

  // Mon-Wed -> next day
  // Thu -> next day (Fri)
  // Fri -> next working day (Mon)
  // Sat/Sun should never be clearing dates (shift to Monday)
  if (day === 5) {
    result.setDate(result.getDate() + 3); // Friday -> Monday
  } else if (day === 6) {
    result.setDate(result.getDate() + 2); // Saturday -> Monday
  } else if (day === 0) {
    result.setDate(result.getDate() + 1); // Sunday -> Monday
  } else {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

// Sample cheque data
export const cheques: Cheque[] = [];

// Sample supplier data
export const suppliers: Supplier[] = [];

// Business metrics
export const avgDailySales = 75000;

// Helper functions
export function getTotalClearingToday(
  chequesToUse: Cheque[] = cheques,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return chequesToUse
    .filter((c) => {
      const clearDate = getClearingDate(c.issueDate);
      clearDate.setHours(0, 0, 0, 0);
      return clearDate.getTime() === today.getTime() && c.status === "pending";
    })
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getTotalClearingTomorrow(
  chequesToUse: Cheque[] = cheques,
): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return chequesToUse
    .filter((c) => {
      const clearDate = getClearingDate(c.issueDate);
      clearDate.setHours(0, 0, 0, 0);
      return (
        clearDate.getTime() === tomorrow.getTime() && c.status === "pending"
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getChequesClearingTomorrowCount(
  chequesToUse: Cheque[] = cheques,
): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return chequesToUse.filter((c) => {
    const clearDate = getClearingDate(c.issueDate);
    clearDate.setHours(0, 0, 0, 0);
    return clearDate.getTime() === tomorrow.getTime() && c.status === "pending";
  }).length;
}

export function getTotalSupplierDebt(
  suppliersToUse: Supplier[] = suppliers,
): number {
  return suppliersToUse.reduce((sum, s) => sum + s.totalDebt, 0);
}

// Get the next working day (skip weekends)
export function getNextWorkingDay(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  // Monday to Thursday -> clears next day
  // Friday -> clears Monday
  if (day === 5) {
    // Friday
    result.setDate(result.getDate() + 3); // Monday
  } else if (day === 6) {
    // Saturday
    result.setDate(result.getDate() + 2); // Monday
  } else if (day === 0) {
    // Sunday
    result.setDate(result.getDate() + 1); // Monday
  } else {
    result.setDate(result.getDate() + 1); // Next day
  }

  return result;
}

// Get the next N working days (excluding weekends)
export function getNextWorkingDays(count: number): Date[] {
  const result: Date[] = [];
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  // Add today if it's a working day
  if (current.getDay() !== 0 && current.getDay() !== 6) {
    result.push(new Date(current));
  }

  while (result.length < count) {
    current.setDate(current.getDate() + 1);
    // Skip weekends
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      result.push(new Date(current));
    }
  }

  return result;
}

export function getUpcomingChequeCalendar(
  chequesToUse: Cheque[] = cheques,
): DailyTotal[] {
  const workingDays = getNextWorkingDays(5);

  return workingDays.map((date) => {
    const dayCheques = chequesToUse.filter((c) => {
      const clearDate = getClearingDate(c.issueDate);
      clearDate.setHours(0, 0, 0, 0);
      return clearDate.getTime() === date.getTime() && c.status === "pending";
    });

    return {
      date,
      amount: dayCheques.reduce((sum, c) => sum + c.amount, 0),
      count: dayCheques.length,
    };
  });
}

export function getSupplierTrustScoreData() {
  return suppliers.map((s) => ({
    name: s.name.split(" ")[0],
    score: s.trustScore,
    debt: s.totalDebt,
  }));
}

export function formatCurrency(amount: number): string {
  return `GH₵ ${new Intl.NumberFormat("en-GH", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
