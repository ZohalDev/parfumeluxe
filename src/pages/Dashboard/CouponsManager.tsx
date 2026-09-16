import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function CouponsManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [editingCoupon, setEditingCoupon] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    discountType: "percentage" as "percentage" | "fixed",
    minOrder: "",
    maxUses: "",
    isActive: true,
  });

  const utils = trpc.useUtils();
  const { data: coupons, isLoading } = trpc.admin.listCoupons.useQuery({
    search,
    limit: pageSize,
    offset: page * pageSize,
  });

  const createMutation = trpc.admin.createCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast.success("Coupon created");
    },
  });

  const updateMutation = trpc.admin.updateCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      setEditingCoupon(null);
      setIsAddOpen(false);
      toast.success("Coupon updated");
    },
  });

  const deleteMutation = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success("Coupon deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      discountType: "percentage",
      minOrder: "",
      maxUses: "",
      isActive: true,
    });
  };

  const handleSubmit = () => {
    const data = {
      code: formData.code,
      discount: Number(formData.discount),
      discountType: formData.discountType,
      minOrder: formData.minOrder ? Number(formData.minOrder) : undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (coupon: NonNullable<typeof coupons>["items"][number]) => {
    setEditingCoupon(coupon.id);
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      discountType: coupon.discountType,
      minOrder: coupon.minOrder ? coupon.minOrder.toString() : "",
      maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
      isActive: coupon.isActive ?? true,
    });
    setIsAddOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil((coupons?.total ?? 0) / pageSize));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-slate-500">Manage promotional codes</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCoupon(null); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Code</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                  placeholder="SUMMER20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Value</Label>
                  <Input 
                    type="number" 
                    value={formData.discount} 
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order Value</Label>
                  <Input 
                    type="number" 
                    value={formData.minOrder} 
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })} 
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Max Uses</Label>
                  <Input 
                    type="number" 
                    value={formData.maxUses} 
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} 
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search coupons..."
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : coupons?.items.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Ticket className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No coupons found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-slate-800">
                <th className="pb-2 text-left font-medium">Code</th>
                <th className="pb-2 text-left font-medium">Discount</th>
                <th className="pb-2 text-left font-medium">Uses</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {coupons?.items?.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="py-3">
                    <span className="font-bold text-lg tracking-wider">{coupon.code}</span>
                  </td>
                  <td className="py-3">
                    {coupon.discountType === "percentage" 
                      ? `${coupon.discount}%` 
                      : `$${coupon.discount}`}
                  </td>
                  <td className="py-3">
                    {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
                  </td>
                  <td className="py-3">
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(coupon)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteMutation.mutate(coupon.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
