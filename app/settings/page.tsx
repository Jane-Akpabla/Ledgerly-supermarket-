"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, RotateCcw } from "lucide-react";
import { settingsStore, type BrandSettings } from "@/lib/settings-store";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BrandSettings>({
    brandName: "Ledgerly",
    logoUrl: "",
    primaryColor: "#3b82f6",
    theme: "light",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    settingsStore.loadSettings();
    const currentSettings = settingsStore.getSettings();
    setSettings(currentSettings);
    setLogoPreviewUrl(currentSettings.logoUrl);
  }, []);

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextBrandName = e.target.value;
    setSettings({ ...settings, brandName: nextBrandName });
    settingsStore.updateBrandName(nextBrandName);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSettings({ ...settings, primaryColor: color });
    document.documentElement.style.setProperty("--color-primary", color);
    settingsStore.updatePrimaryColor(color);
  };

  const handleThemeChange = (theme: "light" | "dark") => {
    setSettings({ ...settings, theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    settingsStore.updateTheme(theme);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoPreviewUrl(dataUrl);
        setSettings({ ...settings, logoUrl: dataUrl });
        settingsStore.updateLogoUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);

    settingsStore.updateBrandName(settings.brandName);
    settingsStore.updateLogoUrl(settings.logoUrl);
    settingsStore.updatePrimaryColor(settings.primaryColor);
    settingsStore.updateTheme(settings.theme);

    const updatedSettings = settingsStore.getSettings();
    setSettings(updatedSettings);
    setLogoPreviewUrl(updatedSettings.logoUrl);

    setSavedMessage("Settings saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);

    setIsSaving(false);
  };

  const handleResetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      settingsStore.resetToDefaults();
      setSettings(settingsStore.getSettings());
      setLogoPreviewUrl("");
      setSavedMessage("Settings reset to defaults!");
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize your Ledgerly experience
          </p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-3 text-sm text-success">
            {savedMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Brand Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Brand Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={settings.brandName}
                  onChange={handleBrandNameChange}
                  placeholder="Enter brand name"
                  className="text-base"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Brand Logo</Label>
                <div className="flex gap-3">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                </div>
                {logoPreviewUrl && (
                  <div className="mt-3 rounded-lg border border-border p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      Preview:
                    </p>
                    <div className="h-16 w-16 rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
                      <img
                        src={logoPreviewUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Input
                      id="primaryColor"
                      type="text"
                      value={settings.primaryColor}
                      onChange={handleColorChange}
                      placeholder="#3b82f6"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorChange(e)}
                      className="h-10 w-14 rounded border border-input cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 text-xs text-muted-foreground">
                  <span>Preview:</span>
                  <span
                    className="px-3 py-1 rounded text-white font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Sample
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Toggle */}
              <div className="space-y-3">
                <Label>Appearance Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      settings.theme === "light"
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-medium">Light Mode</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      settings.theme === "dark"
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </button>
                </div>
                {settings.theme === "dark" && (
                  <Badge variant="secondary" className="w-fit">
                    Dark mode activated
                  </Badge>
                )}
              </div>

              {/* Current Settings Summary */}
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium">Current Settings:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Brand: {settings.brandName}</p>
                  <p>• Color: {settings.primaryColor}</p>
                  <p>
                    • Theme:{" "}
                    {settings.theme.charAt(0).toUpperCase() +
                      settings.theme.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1"
            size="lg"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="destructive"
            size="lg"
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                💡 Tip: Use the settings below to personalize your Ledgerly
                experience
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Change your brand name to match your business identity</li>
                <li>Upload your business logo for a personalized dashboard</li>
                <li>Select your brand color to customize the interface</li>
                <li>
                  Toggle between light and dark mode based on your preference
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
