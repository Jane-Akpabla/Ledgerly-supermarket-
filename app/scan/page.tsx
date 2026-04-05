"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  FileImage,
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "scanning" | "success" | "error";

export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [dragActive, setDragActive] = useState(false);

  const handleScan = () => {
    setScanState("scanning");

    // Simulate OCR processing
    setTimeout(() => {
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.3;
      setScanState(success ? "success" : "error");
    }, 2500);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleScan();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleScan();
    }
  };

  const resetScan = () => {
    setScanState("idle");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              Scan Ledger Page
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use OCR to extract cheque data from images
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          {scanState === "idle" && (
            <Card>
              <CardContent className="p-6">
                {/* Drop Zone */}
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    Scan Ledger Page
                  </h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Take a photo or upload an image of your ledger page to
                    automatically extract cheque information
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" className="gap-2" onClick={handleScan}>
                      <Camera className="h-5 w-5" />
                      Open Camera
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-5 w-5" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </label>
                    </Button>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, HEIC
                  </p>
                </div>

                {/* Tips */}
                <div className="mt-6 rounded-lg bg-secondary/50 p-4">
                  <h4 className="font-medium text-foreground">
                    Tips for best results
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Ensure good lighting and avoid shadows
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Keep the ledger page flat and aligned
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Capture the entire page in frame
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {scanState === "scanning" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary">
                    <FileImage className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine className="h-24 w-24 animate-pulse text-primary" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Processing Image...
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Extracting cheque information using OCR
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {scanState === "success" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Scan Successful!
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  We found 3 cheques in your ledger page.
                  <br />
                  Review and confirm the extracted data.
                </p>

                {/* Mock extracted data preview */}
                <div className="mt-6 w-full space-y-2">
                  {[
                    { no: "CHQ-015", supplier: "Fresh Farms Ltd", amount: "GH₵ 32,000" },
                    { no: "CHQ-016", supplier: "Dairy Direct", amount: "GH₵ 18,500" },
                    { no: "CHQ-017", supplier: "Metro Wholesale", amount: "GH₵ 45,000" },
                  ].map((cheque) => (
                    <div
                      key={cheque.no}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div>
                        <span className="font-medium text-foreground">
                          {cheque.no}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {cheque.supplier}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {cheque.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button asChild>
                    <Link href="/add-cheque">Confirm & Add</Link>
                  </Button>
                  <Button variant="outline" onClick={resetScan}>
                    Scan Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {scanState === "error" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Scan Failed
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  We couldn&apos;t extract cheque data from this image.
                  <br />
                  Please try again with a clearer photo.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button onClick={resetScan}>Try Again</Button>
                  <Button variant="outline" asChild>
                    <Link href="/add-cheque">Add Manually</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
