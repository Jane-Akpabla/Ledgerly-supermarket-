"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { settingsStore } from "@/lib/settings-store";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login"];

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    settingsStore.loadSettings();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session && !PUBLIC_PATHS.includes(pathname)) {
        router.replace("/login");
      }

      if (data.session && pathname === "/login") {
        router.replace("/");
      }

      setCheckedAuth(true);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session && !PUBLIC_PATHS.includes(pathname)) {
        router.replace("/login");
      }

      if (session && pathname === "/login") {
        router.replace("/");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [pathname, router]);

  if (!checkedAuth && !PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
