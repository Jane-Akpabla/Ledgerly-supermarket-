"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export function ScanLedgerButton() {
  return (
    <Button
      asChild
      size="lg"
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-14 text-base font-semibold"
    >
      <Link href="/scan" className="flex items-center justify-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
          <Camera className="h-5 w-5" />
        </div>
        Scan Ledger Page
      </Link>
    </Button>
  );
}
