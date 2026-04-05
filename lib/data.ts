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
export const cheques: Cheque[] = [
  {
    id: "1",
    chequeNo: "CHQ-001",
    supplier: "Fresh Farms Ltd",
    supplierId: "1",
    amount: 45000,
    bank: "State Bank",
    issueDate: new Date(2026, 3, 1),
    clearingDate: getClearingDate(new Date(2026, 3, 1)),
    status: "pending",
  },
  {
    id: "2",
    chequeNo: "CHQ-002",
    supplier: "Dairy Direct",
    supplierId: "2",
    amount: 28500,
    bank: "National Bank",
    issueDate: new Date(2026, 3, 1),
    clearingDate: getClearingDate(new Date(2026, 3, 1)),
    status: "pending",
  },
  {
    id: "3",
    chequeNo: "CHQ-003",
    supplier: "Metro Wholesale",
    supplierId: "3",
    amount: 62000,
    bank: "City Bank",
    issueDate: new Date(2026, 3, 2),
    clearingDate: getClearingDate(new Date(2026, 3, 2)),
    status: "pending",
  },
  {
    id: "4",
    chequeNo: "CHQ-004",
    supplier: "Spice Garden",
    supplierId: "4",
    amount: 15800,
    bank: "State Bank",
    issueDate: new Date(2026, 3, 2),
    clearingDate: getClearingDate(new Date(2026, 3, 2)),
    status: "cleared",
  },
  {
    id: "5",
    chequeNo: "CHQ-005",
    supplier: "PackIt Solutions",
    supplierId: "5",
    amount: 8200,
    bank: "Rural Bank",
    issueDate: new Date(2026, 3, 3),
    clearingDate: getClearingDate(new Date(2026, 3, 3)),
    status: "pending",
  },
  {
    id: "6",
    chequeNo: "CHQ-006",
    supplier: "Fresh Farms Ltd",
    supplierId: "1",
    amount: 38000,
    bank: "State Bank",
    issueDate: new Date(2026, 3, 4),
    clearingDate: getClearingDate(new Date(2026, 3, 4)),
    status: "pending",
  },
  {
    id: "7",
    chequeNo: "CHQ-007",
    supplier: "Beverages Plus",
    supplierId: "6",
    amount: 52000,
    bank: "National Bank",
    issueDate: new Date(2026, 3, 4),
    clearingDate: getClearingDate(new Date(2026, 3, 4)),
    status: "pending",
  },
  {
    id: "8",
    chequeNo: "CHQ-008",
    supplier: "Clean Supplies Co",
    supplierId: "7",
    amount: 12500,
    bank: "City Bank",
    issueDate: new Date(2026, 3, 5),
    clearingDate: getClearingDate(new Date(2026, 3, 5)),
    status: "bounced",
  },
  {
    id: "9",
    chequeNo: "CHQ-009",
    supplier: "Dairy Direct",
    supplierId: "2",
    amount: 31000,
    bank: "National Bank",
    issueDate: new Date(2026, 3, 5),
    clearingDate: getClearingDate(new Date(2026, 3, 5)),
    status: "pending",
  },
  {
    id: "10",
    chequeNo: "CHQ-010",
    supplier: "Metro Wholesale",
    supplierId: "3",
    amount: 48500,
    bank: "City Bank",
    issueDate: new Date(2026, 3, 6),
    clearingDate: getClearingDate(new Date(2026, 3, 6)),
    status: "pending",
  },
];

// Sample supplier data
export const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Fresh Farms Ltd",
    phone: "+233 24 765 4321",
    location: "Tema Industrial Area",
    productsSupplied: ["Vegetables", "Fruits", "Organic Produce"],
    totalDebt: 83000,
    oldestUnpaidBillDays: 45,
    trustScore: 85,
  },
  {
    id: "2",
    name: "Dairy Direct",
    phone: "+233 20 654 3210",
    location: "Accra Central",
    productsSupplied: ["Milk", "Cheese", "Butter", "Yogurt"],
    totalDebt: 59500,
    oldestUnpaidBillDays: 22,
    trustScore: 92,
  },
  {
    id: "3",
    name: "Metro Wholesale",
    phone: "+233 27 543 2109",
    location: "Kumasi Market District",
    productsSupplied: ["Grains", "Pulses", "Dry Goods"],
    totalDebt: 110500,
    oldestUnpaidBillDays: 38,
    trustScore: 78,
  },
  {
    id: "4",
    name: "Spice Garden",
    phone: "+233 26 432 1098",
    location: "Osu, Accra",
    productsSupplied: ["Spices", "Condiments", "Pickles"],
    totalDebt: 15800,
    oldestUnpaidBillDays: 12,
    trustScore: 95,
  },
  {
    id: "5",
    name: "PackIt Solutions",
    phone: "+233 23 321 0987",
    location: "Spintex Industrial",
    productsSupplied: ["Packaging", "Bags", "Containers"],
    totalDebt: 8200,
    oldestUnpaidBillDays: 8,
    trustScore: 88,
  },
  {
    id: "6",
    name: "Beverages Plus",
    phone: "+233 50 210 9876",
    location: "East Legon",
    productsSupplied: ["Soft Drinks", "Juices", "Water"],
    totalDebt: 52000,
    oldestUnpaidBillDays: 35,
    trustScore: 72,
  },
  {
    id: "7",
    name: "Clean Supplies Co",
    phone: "+233 54 109 8765",
    location: "Tema Community 1",
    productsSupplied: ["Detergents", "Cleaning Products", "Sanitizers"],
    totalDebt: 24500,
    oldestUnpaidBillDays: 55,
    trustScore: 65,
  },
];

// Business metrics
export const avgDailySales = 75000;

// Helper functions
export function getTotalClearingToday(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cheques
    .filter((c) => {
      const clearDate = getClearingDate(c.issueDate);
      clearDate.setHours(0, 0, 0, 0);
      return clearDate.getTime() === today.getTime() && c.status === "pending";
    })
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getTotalClearingTomorrow(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return cheques
    .filter((c) => {
      const clearDate = getClearingDate(c.issueDate);
      clearDate.setHours(0, 0, 0, 0);
      return (
        clearDate.getTime() === tomorrow.getTime() && c.status === "pending"
      );
    })
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getChequesClearingTomorrowCount(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return cheques.filter((c) => {
    const clearDate = getClearingDate(c.issueDate);
    clearDate.setHours(0, 0, 0, 0);
    return clearDate.getTime() === tomorrow.getTime() && c.status === "pending";
  }).length;
}

export function getTotalSupplierDebt(): number {
  return suppliers.reduce((sum, s) => sum + s.totalDebt, 0);
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

export function getUpcomingChequeCalendar(): DailyTotal[] {
  const workingDays = getNextWorkingDays(5);

  return workingDays.map((date) => {
    const dayCheques = cheques.filter((c) => {
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
