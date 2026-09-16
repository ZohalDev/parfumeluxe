import { Link } from "react-router";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  comparePrice: string | null;
  image: string | null;
  brand: string | null;
  rating: string | null;
  reviewCount: number | null;
  category?: { name: string } | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const utils = trpc.useUtils();
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Added to cart");
    },
  });

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const liked = isInWishlist(product.id);
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
    addItem({
      productId: product.id,
      slug: product.slug,
      quantity: 1,
      name: product.name,
      price: price,
      image: product.image || "",
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card card-luxury">
      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-muted/30 to-muted/60"
      >
        <img
          src={product.image || "/images/perfume1.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

        {/* Sale badge */}
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-gold-sm">
            -{discount}%
          </span>
        )}

        {/* Quick actions overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-4 translate-y-full opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-full bg-white/95 text-slate-900 hover:bg-white shadow-lg text-xs font-medium backdrop-blur-md hover:shadow-gold-sm transition-all duration-300"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Bag
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/95 text-slate-900 hover:bg-white shadow-lg p-0 backdrop-blur-md hover:shadow-gold-sm transition-all duration-300"
            asChild
          >
            <Link to={`/product/${product.slug}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur-md transition-all duration-300 ${
          liked
            ? "bg-red-50 text-red-500 dark:bg-red-950/50 shadow-md scale-110 animate-pulse-gold"
            : "bg-white/80 text-muted-foreground hover:bg-white hover:text-red-500 hover:scale-110 dark:bg-black/40 dark:hover:bg-black/60"
        }`}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            liked ? "fill-red-500 scale-110" : "scale-100"
          }`}
        />
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4 pt-3">
        {product.brand && (
          <p className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-[0.18em]">
            {product.brand}
          </p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 text-sm font-medium text-foreground line-clamp-1 transition-colors duration-300 group-hover:text-gold-700 dark:group-hover:text-gold-400">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && Number(product.rating) > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(Number(product.rating))
                      ? "fill-gold-400 text-gold-400"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-foreground">
            {price.toFixed(0)} MAD
          </span>
          {comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {comparePrice.toFixed(0)} MAD
            </span>
          )}
        </div>
      </div>

      {/* Bottom gold accent bar – appears on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
