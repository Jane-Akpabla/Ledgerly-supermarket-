import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create client only if credentials are available
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient!;

// Type for Cheque from database
export interface ChequeRow {
  id: string;
  cheque_no: string;
  supplier_name: string;
  amount: number;
  bank: string;
  issue_date: string;
  clearing_date: string;
  status: "pending" | "cleared" | "bounced" | "stopped";
  created_at: string;
  updated_at: string;
}
