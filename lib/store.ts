"use client";

import useSWR, { mutate } from "swr";
import { supabase, type ChequeRow } from "./supabase";
import { suppliers, type Supplier, type Cheque } from "./data";

// In-memory suppliers store (can be migrated to Supabase later)
let suppliersStore = [...suppliers];

// Helper to convert Supabase ChequeRow to Cheque type
function convertRowToCheque(row: ChequeRow): Cheque {
  return {
    id: row.id,
    chequeNo: row.cheque_no,
    supplier: row.supplier_name,
    supplierId: "", // Can be enhanced with a supplier_id foreign key
    amount: Number(row.amount),
    bank: row.bank,
    issueDate: new Date(row.issue_date),
    clearingDate: new Date(row.clearing_date),
    status: row.status,
  };
}

// SWR fetcher for cheques from Supabase
const fetchCheques = async (): Promise<Cheque[]> => {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized. Using mock data.");
      return [];
    }

    const { data, error } = await supabase
      .from("cheques")
      .select("*")
      .order("clearing_date", { ascending: true });

    if (error) {
      console.error("Error fetching cheques from Supabase:", error);
      return [];
    }

    return (data as ChequeRow[]).map(convertRowToCheque);
  } catch (err) {
    console.error("Error in fetchCheques:", err);
    return [];
  }
};

const fetchSuppliers = () => Promise.resolve(suppliersStore);

// Hooks for data fetching
export function useCheques() {
  const { data, error, isLoading } = useSWR("cheques", fetchCheques, {
    revalidateOnFocus: true,
    dedupingInterval: 0,
  });
  return {
    cheques: data || [],
    isLoading,
    isError: error,
  };
}

export function useSuppliers() {
  const { data, error, isLoading } = useSWR("suppliers", fetchSuppliers, {
    fallbackData: suppliersStore,
  });
  return {
    suppliers: data || [],
    isLoading,
    isError: error,
  };
}

// Mutation functions
export async function updateChequeStatus(id: string, status: Cheque["status"]) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return;
  }

  const { error } = await supabase
    .from("cheques")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating cheque status:", error);
    return;
  }

  await mutate("cheques");
}

export async function updateChequeClearingDate(
  id: string,
  newClearingDate: Date,
) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return;
  }

  const { error } = await supabase
    .from("cheques")
    .update({ clearing_date: newClearingDate.toISOString().split("T")[0] })
    .eq("id", id);

  if (error) {
    console.error("Error updating cheque clearing date:", error);
    return;
  }

  await mutate("cheques");
}

export async function addCheque(cheque: Omit<Cheque, "id">) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("cheques")
    .insert([
      {
        cheque_no: cheque.chequeNo,
        supplier_name: cheque.supplier,
        amount: cheque.amount,
        bank: cheque.bank,
        issue_date: cheque.issueDate.toISOString().split("T")[0],
        clearing_date: cheque.clearingDate.toISOString().split("T")[0],
        status: cheque.status,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding cheque:", error);
    return null;
  }

  await mutate("cheques");
  return data?.[0] ? convertRowToCheque(data[0] as ChequeRow) : null;
}

export async function addSupplier(supplier: Omit<Supplier, "id">) {
  const newSupplier: Supplier = {
    ...supplier,
    id: String(suppliersStore.length + 1),
  };
  suppliersStore = [...suppliersStore, newSupplier];
  await mutate("suppliers");
  return newSupplier;
}
