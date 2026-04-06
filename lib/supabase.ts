import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create dummy client for build-time when env vars are missing
const createDummyClient = () => {
  // Use placeholder values that won't cause errors during build
  return createClient(
    "https://dummy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy"
  );
};

// Create client with real credentials if available, otherwise use dummy
const supabaseClient = (() => {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  // Return dummy client for build time
  return createDummyClient();
})();

export const supabase = supabaseClient;

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
