"use client";

import useSWR, { mutate } from "swr";
import { supabase, type ChequeRow, type SupplierRow } from "./supabase";
import { suppliers, type Supplier, type Cheque } from "./data";
import { notificationsStore } from "./notifications-store";

// In-memory suppliers store (can be migrated to Supabase later)
let suppliersStore = [...suppliers];

// Helper to convert Supabase ChequeRow to Cheque type
function convertRowToCheque(row: ChequeRow): Cheque {
  return {
    id: row.id,
    chequeNo: row.cheque_no,
    supplier: row.supplier_name,
    supplierId: "", // Can be enhanced with a supplier_id foreign key
    amount: Number(row.amount ?? "0"),
    bank: row.bank,
    issueDate: new Date(row.issue_date),
    clearingDate: new Date(row.clearing_date),
    status: row.status,
  };
}

// Helper to convert Supabase SupplierRow to Supplier type
function convertRowToSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    location: row.location ?? "",
    productsSupplied: row.products_supplied ?? [],
    totalDebt: Number(row.total_debt ?? "0"),
    oldestUnpaidBillDays: row.oldest_unpaid_bill_days,
    trustScore: row.trust_score,
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

const fetchSuppliers = async (): Promise<Supplier[]> => {
  if (!supabase) {
    console.warn("Supabase not initialized. Using local supplier fallback.");
    return suppliersStore;
  }

  const { data, error } = await supabase.from("suppliers").select("*");

  if (error) {
    console.error("Error fetching suppliers from Supabase:", error);
    return suppliersStore;
  }

  return (data as SupplierRow[]).map(convertRowToSupplier) || suppliersStore;
};

// Hooks for data fetching
export function useCheques() {
  const { data, error, isLoading } = useSWR("cheques", fetchCheques, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
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

  // Add notification based on status
  const statusMessages: Record<
    Cheque["status"],
    { type: any; title: string; description: string }
  > = {
    cleared: {
      type: "cheque_cleared",
      title: "Cheque Cleared",
      description: "A cheque has been successfully cleared.",
    },
    bounced: {
      type: "cheque_bounced",
      title: "Cheque Bounced",
      description: "A cheque has bounced. Take immediate action.",
    },
    stopped: {
      type: "cheque_stopped",
      title: "Cheque Stopped",
      description: "A cheque payment has been stopped.",
    },
    pending: {
      type: "cheque_added",
      title: "Cheque Status Updated",
      description: "A cheque status has been updated to pending.",
    },
  };

  const message = statusMessages[status];
  await notificationsStore.addNotification({
    type: message.type,
    title: message.title,
    description: message.description,
  });

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

  const result = data?.[0] ? convertRowToCheque(data[0] as ChequeRow) : null;

  if (result) {
    await notificationsStore.addNotification({
      type: "cheque_added",
      title: "New Cheque Added",
      description: `Cheque ${cheque.chequeNo} from ${cheque.supplier} has been added.`,
    });
  }

  await mutate("cheques");
  return result;
}

export async function deleteCheque(id: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase not initialized");
    return false;
  }

  let previousCheques: Cheque[] = [];

  // Optimistically remove the cheque from cache for instant UI feedback
  await mutate(
    "cheques",
    (current: Cheque[] = []) => {
      previousCheques = current;
      return current.filter((cheque) => cheque.id !== id);
    },
    false,
  );

  const { error } = await supabase.from("cheques").delete().eq("id", id);

  if (error) {
    console.error("Error deleting cheque:", error);
    // Roll back optimistic update on failure
    await mutate("cheques", previousCheques, false);
    return false;
  }

  await mutate("cheques");
  return true;
}

export async function addSupplier(supplier: Omit<Supplier, "id">) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("suppliers")
    .insert([
      {
        name: supplier.name,
        phone: supplier.phone,
        location: supplier.location,
        products_supplied: supplier.productsSupplied,
        total_debt: supplier.totalDebt,
        oldest_unpaid_bill_days: supplier.oldestUnpaidBillDays,
        trust_score: supplier.trustScore,
      },
    ])
    .select();

  if (error) {
    console.error("Error adding supplier:", error);
    return null;
  }

  const result = data?.[0]
    ? convertRowToSupplier(data[0] as SupplierRow)
    : null;

  if (result) {
    await notificationsStore.addNotification({
      type: "supplier_added",
      title: "New Supplier Added",
      description: `${supplier.name} has been added to your supplier list.`,
    });
  }

  await mutate("suppliers");
  return result;
}

export async function updateSupplier(
  id: string,
  supplier: Partial<Omit<Supplier, "id">>,
) {
  if (!supabase) {
    console.error("Supabase not initialized");
    return null;
  }

  const updateData: Record<string, any> = {};
  if (supplier.name !== undefined) updateData.name = supplier.name;
  if (supplier.phone !== undefined) updateData.phone = supplier.phone;
  if (supplier.location !== undefined) updateData.location = supplier.location;
  if (supplier.productsSupplied !== undefined)
    updateData.products_supplied = supplier.productsSupplied;
  if (supplier.totalDebt !== undefined)
    updateData.total_debt = supplier.totalDebt;
  if (supplier.oldestUnpaidBillDays !== undefined)
    updateData.oldest_unpaid_bill_days = supplier.oldestUnpaidBillDays;
  if (supplier.trustScore !== undefined)
    updateData.trust_score = supplier.trustScore;

  const { data, error } = await supabase
    .from("suppliers")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating supplier:", error);
    return null;
  }

  const result = data?.[0]
    ? convertRowToSupplier(data[0] as SupplierRow)
    : null;

  if (result) {
    await notificationsStore.addNotification({
      type: "supplier_updated",
      title: "Supplier Updated",
      description: `${result.name} information has been updated.`,
    });
  }

  await mutate("suppliers");
  return result;
}

export async function deleteSupplier(
  id: string,
  supplierName: string,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.error("Supabase not initialized");
    return { success: false, error: "Supabase not initialized." };
  }

  const { count, error: chequeCheckError } = await supabase
    .from("cheques")
    .select("id", { count: "exact", head: true })
    .eq("supplier_name", supplierName);

  if (chequeCheckError) {
    console.error("Error checking supplier cheques:", chequeCheckError);
    return { success: false, error: "Failed to verify supplier cheques." };
  }

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: "Cannot delete supplier with active cheques.",
    };
  }

  let previousSuppliers: Supplier[] = [];
  await mutate(
    "suppliers",
    (current: Supplier[] = []) => {
      previousSuppliers = current;
      return current.filter((supplier) => supplier.id !== id);
    },
    false,
  );

  const { error } = await supabase.from("suppliers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting supplier:", error);
    await mutate("suppliers", previousSuppliers, false);
    return { success: false, error: "Failed to delete supplier." };
  }

  await notificationsStore.addNotification({
    type: "supplier_deleted",
    title: "Supplier Deleted",
    description: "A supplier has been removed from your list.",
  });

  await mutate("suppliers");
  return { success: true };
}
