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
