"use client";

import { useEffect } from "react";
import { settingsStore } from "@/lib/settings-store";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize settings from localStorage on app load
    settingsStore.loadSettings();
  }, []);

  return <>{children}</>;
}
