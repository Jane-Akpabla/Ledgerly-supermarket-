"use client";

import useSWR, { mutate } from "swr";
import { cheques, suppliers, type Cheque, type Supplier } from "./data";

// In-memory store (in a real app, this would be a database)
let chequesStore = [...cheques];
let suppliersStore = [...suppliers];

// SWR fetchers
const fetchCheques = () => Promise.resolve(chequesStore);
const fetchSuppliers = () => Promise.resolve(suppliersStore);

// Hooks for data fetching
export function useCheques() {
  const { data, error, isLoading } = useSWR("cheques", fetchCheques, {
    fallbackData: chequesStore,
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
  chequesStore = chequesStore.map((c) => (c.id === id ? { ...c, status } : c));
  await mutate("cheques");
}

export async function updateChequeClearingDate(
  id: string,
  newClearingDate: Date,
) {
  chequesStore = chequesStore.map((c) =>
    c.id === id ? { ...c, clearingDate: newClearingDate } : c,
  );
  await mutate("cheques");
}

export async function addCheque(cheque: Omit<Cheque, "id">) {
  const newCheque: Cheque = {
    ...cheque,
    id: String(chequesStore.length + 1),
  };
  chequesStore = [...chequesStore, newCheque];
  await mutate("cheques");
  return newCheque;
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
