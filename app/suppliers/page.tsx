"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  Shield,
  ArrowUpDown,
  Users,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  useSuppliers,
  updateSupplier,
  deleteSupplier,
  addSupplier,
} from "@/lib/store";

import { formatCurrency, type Supplier } from "@/lib/data";
import { cn } from "@/lib/utils";

type SortOption = "name" | "priority" | "trust" | "debt";

export default function SuppliersPage() {
  const { suppliers, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const processedSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.productsSupplied.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      if (showHighPriorityOnly) {
        return matchesSearch && supplier.oldestUnpaidBillDays > 30;
      }

      return matchesSearch;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          // High priority (unpaid > 30 days) first, then by oldest unpaid days
          const aHighPriority = a.oldestUnpaidBillDays > 30 ? 1 : 0;
          const bHighPriority = b.oldestUnpaidBillDays > 30 ? 1 : 0;
          if (bHighPriority !== aHighPriority)
            return bHighPriority - aHighPriority;
          return b.oldestUnpaidBillDays - a.oldestUnpaidBillDays;
        case "name":
          return a.name.localeCompare(b.name);
        case "trust":
          return b.trustScore - a.trustScore;
        case "debt":
          return b.totalDebt - a.totalDebt;
        default:
          return 0;
      }
    });

    return filtered;
  }, [suppliers, searchQuery, sortBy, showHighPriorityOnly]);

  const highPriorityCount = suppliers.filter(
    (s) => s.oldestUnpaidBillDays > 30,
  ).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              Supplier Directory
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your supplier relationships
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {highPriorityCount > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 border-destructive/50 bg-destructive/10 text-destructive self-start"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {highPriorityCount} High Priority
              </Badge>
            )}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showHighPriorityOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHighPriorityOnly(!showHighPriorityOnly)}
              className="gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              High Priority
            </Button>
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Supplier Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat
            label="Total Suppliers"
            value={suppliers.length}
            icon={<Users className="h-4 w-4" />}
          />
          <MiniStat
            label="High Priority"
            value={highPriorityCount}
            icon={<AlertTriangle className="h-4 w-4" />}
            className="text-destructive"
          />
          <MiniStat
            label="Avg Trust Score"
            value={`${Math.round(
              suppliers.reduce((sum, s) => sum + s.trustScore, 0) /
                suppliers.length,
            )}%`}
            icon={<Shield className="h-4 w-4" />}
            className="text-success"
          />
          <MiniStat
            label="Total Debt"
            value={formatCurrency(
              suppliers.reduce((sum, s) => sum + s.totalDebt, 0),
            )}
            icon={<Package className="h-4 w-4" />}
          />
        </div>

        {/* Supplier List */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : processedSuppliers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No suppliers found
                </p>
              </CardContent>
            </Card>
          ) : (
            processedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onEdit={(supplier) => {
                  setEditingSupplier(supplier);
                  setIsEditDialogOpen(true);
                }}
                onDelete={(id) => {
                  setDeletingId(id);
                  setIsDeleteDialogOpen(true);
                }}
              />
            ))
          )}
        </div>

        {/* Edit Supplier Dialog */}
        <SupplierEditModal
          supplier={editingSupplier}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={async (updatedSupplier) => {
            if (editingSupplier) {
              await updateSupplier(editingSupplier.id, updatedSupplier);
              setIsEditDialogOpen(false);
              setEditingSupplier(null);
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Supplier</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this supplier? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (deletingId) {
                    await deleteSupplier(deletingId);
                    setIsDeleteDialogOpen(false);
                    setDeletingId(null);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Supplier Dialog */}
        <AddSupplierModal
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={async (newSupplier) => {
            await addSupplier(newSupplier);
            setIsAddDialogOpen(false);
          }}
        />
      </div>
    </DashboardLayout>
  );
}

interface SupplierEditModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (supplier: Partial<Omit<Supplier, "id">>) => Promise<void>;
}

function SupplierEditModal({
  supplier,
  isOpen,
  onOpenChange,
  onSave,
}: SupplierEditModalProps) {
  const [formData, setFormData] = useState<Partial<Omit<Supplier, "id">>>({});
  const [isSaving, setIsSaving] = useState(false);

  useMemo(() => {
    if (supplier) {
      setFormData(supplier);
    }
  }, [supplier, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Supplier name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt">Total Debt (GH₵)</Label>
            <Input
              id="debt"
              type="number"
              value={formData.totalDebt || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalDebt: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unpaidDays">Oldest Unpaid (Days)</Label>
            <Input
              id="unpaidDays"
              type="number"
              value={formData.oldestUnpaidBillDays || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  oldestUnpaidBillDays: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trust">Trust Score (%)</Label>
            <Input
              id="trust"
              type="number"
              min="0"
              max="100"
              value={formData.trustScore || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trustScore: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0-100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SortDropdown({
  sortBy,
  onSortChange,
}: {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  const options: { value: SortOption; label: string }[] = [
    { value: "priority", label: "Priority" },
    { value: "name", label: "Name" },
    { value: "trust", label: "Trust Score" },
    { value: "debt", label: "Total Debt" },
  ];

  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="h-9 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>
      <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className={cn("text-muted-foreground", className)}>{icon}</div>
        <div className="flex flex-col">
          <span className={cn("text-lg font-bold", className)}>{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SupplierCard({
  supplier,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}) {
  const isHighPriority = supplier.oldestUnpaidBillDays > 30;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isHighPriority && "border-destructive/50",
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Priority Indicator */}
          {isHighPriority && (
            <div className="w-1 flex-shrink-0 bg-destructive" />
          )}

          <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {supplier.name}
                  </h3>
                  {isHighPriority && (
                    <Badge
                      variant="outline"
                      className="border-destructive/50 bg-destructive/10 text-destructive text-xs"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      High Priority
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <a
                    href={`tel:${supplier.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {supplier.phone}
                  </a>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.location}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(supplier)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(supplier.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust Score */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Shield
                    className={cn(
                      "h-4 w-4",
                      supplier.trustScore >= 80
                        ? "text-success"
                        : supplier.trustScore >= 60
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  />
                  <span
                    className={cn(
                      "text-lg font-bold",
                      supplier.trustScore >= 80
                        ? "text-success"
                        : supplier.trustScore >= 60
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {supplier.trustScore}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Trust Score
                </span>
              </div>
            </div>

            {/* Products */}
            <div className="flex flex-wrap gap-1.5">
              {supplier.productsSupplied?.length > 0 ? (
                supplier.productsSupplied.map((product) => (
                  <Badge
                    key={product}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    <Package className="mr-1 h-3 w-3" />
                    {product}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No products listed
                </span>
              )}
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Outstanding Debt</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(supplier.totalDebt)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground">Oldest Unpaid</span>
                <span
                  className={cn(
                    "font-semibold",
                    isHighPriority ? "text-destructive" : "text-foreground",
                  )}
                >
                  {supplier.oldestUnpaidBillDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (supplier: Omit<Supplier, "id">) => Promise<void>;
}

function AddSupplierModal({
  isOpen,
  onOpenChange,
  onSave,
}: AddSupplierModalProps) {
  const [formData, setFormData] = useState<Omit<Supplier, "id">>({
    name: "",
    phone: "",
    location: "",
    productsSupplied: [],
    totalDebt: 0,
    oldestUnpaidBillDays: 0,
    trustScore: 50,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [productsInput, setProductsInput] = useState("");

  const handleSave = async () => {
    if (!formData.name || !formData.location) {
      alert("Please fill in supplier name and location");
      return;
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    // Reset form
    setFormData({
      name: "",
      phone: "",
      location: "",
      productsSupplied: [],
      totalDebt: 0,
      oldestUnpaidBillDays: 0,
      trustScore: 50,
    });
    setProductsInput("");
  };

  const handleAddProduct = () => {
    if (productsInput.trim()) {
      setFormData({
        ...formData,
        productsSupplied: [...formData.productsSupplied, productsInput.trim()],
      });
      setProductsInput("");
    }
  };

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      productsSupplied: formData.productsSupplied.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter the details for the new supplier
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="add-name">Supplier Name *</Label>
            <Input
              id="add-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Supplier name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-phone">Phone</Label>
            <Input
              id="add-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-location">Location *</Label>
            <Input
              id="add-location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Location"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Products Supplied</Label>
            <div className="flex gap-2">
              <Input
                value={productsInput}
                onChange={(e) => setProductsInput(e.target.value)}
                placeholder="Enter product name"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddProduct();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddProduct}
                size="sm"
              >
                Add
              </Button>
            </div>
            {formData.productsSupplied.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.productsSupplied.map((product, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    {product}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-debt">Total Debt (GH₵)</Label>
            <Input
              id="add-debt"
              type="number"
              value={formData.totalDebt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalDebt: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-unpaidDays">Oldest Unpaid (Days)</Label>
            <Input
              id="add-unpaidDays"
              type="number"
              value={formData.oldestUnpaidBillDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  oldestUnpaidBillDays: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-trust">Trust Score (%) - Default 50</Label>
            <Input
              id="add-trust"
              type="number"
              min="0"
              max="100"
              value={formData.trustScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trustScore: parseInt(e.target.value) || 50,
                })
              }
              placeholder="0-100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
