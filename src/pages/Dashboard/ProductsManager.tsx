import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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

export default function ProductsManager() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    image: "",
    categoryId: "",
    brand: "",
    scentNotes: "",
    volume: "100ml",
    stock: "0",
    isFeatured: false,
  });

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.useQuery({
    search,
    limit: pageSize,
    offset: page * pageSize,
  });
  const { data: categories } = trpc.product.listCategories.useQuery();

  const createMutation = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      utils.admin.products.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast.success("Product created");
    },
  });

  const updateMutation = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      utils.admin.products.invalidate();
      setEditingProduct(null);
      toast.success("Product updated");
    },
  });

  const deleteMutation = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      utils.admin.products.invalidate();
      toast.success("Product deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "", slug: "", description: "", price: "", comparePrice: "",
      image: "", categoryId: "", brand: "", scentNotes: "", volume: "100ml", stock: "0", isFeatured: false,
    });
  };

  const handleSubmit = () => {
    const data = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description || undefined,
      price: Number(formData.price),
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
      image: formData.image || undefined,
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      brand: formData.brand || undefined,
      scentNotes: formData.scentNotes || undefined,
      volume: formData.volume,
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (product: NonNullable<typeof products>["items"][number]) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      comparePrice: product.comparePrice || "",
      image: product.image || "",
      categoryId: product.categoryId?.toString() || "",
      brand: product.brand || "",
      scentNotes: product.scentNotes || "",
      volume: product.volume || "100ml",
      stock: product.stock.toString(),
      isFeatured: product.isFeatured ?? false,
    });
    setIsAddOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil((products?.total ?? 0) / pageSize));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-slate-500">Manage your product catalog</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <Label>Compare Price</Label>
                  <Input type="number" value={formData.comparePrice} onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Image URL or Upload (AWS S3)</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={formData.image} 
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                    placeholder="https://..."
                  />
                  <Input
                    type="file"
                    className="w-1/2"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        toast.loading("Uploading image...", { id: "upload" });
                        const { presignedUrl, publicUrl } = await utils.client.admin.getPresignedUrl.mutate({
                          filename: file.name,
                          contentType: file.type,
                        });
                        const uploadRes = await fetch(presignedUrl, {
                          method: "PUT",
                          body: file,
                          headers: { "Content-Type": file.type },
                        });
                        if (uploadRes.ok) {
                          setFormData({ ...formData, image: publicUrl });
                          toast.success("Image uploaded", { id: "upload" });
                        } else {
                          throw new Error("Upload to S3 failed");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Upload failed", { id: "upload" });
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div>
                  <Label>Volume</Label>
                  <Input value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProduct ? "Update" : "Create"} Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search products..."
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-slate-800">
                <th className="pb-2 text-left font-medium">Product</th>
                <th className="pb-2 text-left font-medium">Price</th>
                <th className="pb-2 text-left font-medium">Stock</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {products?.items?.map((product) => (
                <tr key={product.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image || "/images/perfume1.jpg"} alt="" className="h-10 w-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">${Number(product.price).toFixed(2)}</td>
                  <td className="py-3">{product.stock}</td>
                  <td className="py-3">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {product.isFeatured && <Badge className="ml-1 bg-amber-100 text-amber-800">Featured</Badge>}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteMutation.mutate(product.id)}>
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
