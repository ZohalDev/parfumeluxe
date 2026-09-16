import { Link } from "react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/providers/trpc";
import { useCartStore } from "@/store/cartStore";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal } =
    useCartStore();
  const utils = trpc.useUtils();

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });

  const handleUpdate = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
    updateMutation.mutate({ productId, quantity });
  };

  const handleRemove = (productId: number) => {
    removeItem(productId);
    removeMutation.mutate(productId);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-3xl font-bold">Your bag is empty</h2>
        <p className="mt-3 text-muted-foreground">
          Discover our exquisite collection of luxury fragrances
        </p>
        <Button asChild className="mt-8 rounded-full px-8" size="lg">
          <Link to="/products">Explore Collection</Link>
        </Button>
      </div>
    );
  }

  const total = getTotal();
  const shippingFree = total >= 1500;
  const getItemSlug = (item: (typeof items)[number]) =>
    item.slug || item.name.toLowerCase().trim().replace(/\s+/g, "-");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Shopping Bag</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-0 divide-y">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-5 py-6 first:pt-0">
              <Link
                to={`/product/${getItemSlug(item)}`}
                className="shrink-0"
              >
                <img
                  src={item.image || "/images/perfume1.jpg"}
                  alt={item.name}
                  className="h-28 w-28 rounded-xl object-cover transition-transform hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/product/${getItemSlug(item)}`}
                      className="font-medium text-foreground hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.price.toFixed(0)} MAD each
                    </p>
                  </div>
                  <p className="text-base font-bold">
                    {(item.price * item.quantity).toFixed(0)} MAD
                  </p>
                </div>
                <div className="mt-auto pt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-full border">
                    <button
                      className="px-2.5 py-1.5 hover:bg-muted rounded-l-full transition-colors"
                      onClick={() =>
                        handleUpdate(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2.5 py-1.5 hover:bg-muted rounded-r-full transition-colors"
                      onClick={() =>
                        handleUpdate(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                    onClick={() => handleRemove(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{total.toFixed(0)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={`font-medium ${shippingFree ? "text-green-600" : ""}`}>
                  {shippingFree ? "Free" : "150 MAD"}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold">
                  {(shippingFree ? total : total + 150).toFixed(0)} MAD
                </span>
              </div>
            </div>

            {!shippingFree && (
              <div className="mt-4 rounded-xl bg-muted/50 p-3 flex items-start gap-2">
                <Truck className="h-4 w-4 text-gold-600 dark:text-gold-400 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Add <strong className="text-foreground">{(1500 - total).toFixed(0)} MAD</strong> more for
                  free shipping
                </p>
              </div>
            )}

            <Button
              asChild
              className="mt-6 w-full rounded-full h-12 font-medium tracking-wide"
              size="lg"
            >
              <Link to="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="mt-2 w-full text-sm"
            >
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
