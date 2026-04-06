import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-ignore.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChequeRow {
  id: string;
  cheque_no: string;
  supplier_name: string;
  amount: string;
  bank: string;
  issue_date: string;
  clearing_date: string;
  status: "pending" | "cleared" | "bounced" | "stopped";
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  products_supplied: string[] | null;
  total_debt: string | number;
  oldest_unpaid_bill_days: number;
  trust_score: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationRow {
  id: string;
  type:
    | "supplier_added"
    | "supplier_updated"
    | "supplier_deleted"
    | "cheque_added"
    | "cheque_cleared"
    | "cheque_bounced"
    | "cheque_stopped";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  created_at?: string | null;
}
