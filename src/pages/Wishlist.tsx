import { Link } from "react-router";
import { ArrowLeft, Heart, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

export default function Wishlist() {
  const { items: wishlistItems, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: products } = trpc.product.listProducts.useQuery({ limit: 100 });

  const wishlistProducts =
    products?.items.filter((p) => wishlistItems.includes(p.id)) || [];

  const handleAddToCart = (product: (typeof wishlistProducts)[0]) => {
    addItem({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
    });
    toast.success(`${product.name} added to bag`);
  };

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((product) => {
      addItem({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: Number(product.price),
        image: product.image || "",
      });
    });
    toast.success(`${wishlistProducts.length} items added to bag`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-[0.3em] text-gold-600 dark:text-gold-400 uppercase">
            My Collection
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          {wishlistProducts.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {wishlistProducts.length}{" "}
              {wishlistProducts.length === 1 ? "fragrance" : "fragrances"} saved
            </p>
          )}
        </div>
        {wishlistProducts.length > 1 && (
          <Button
            className="rounded-full hidden sm:flex"
            onClick={handleAddAllToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Bag
          </Button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center py-16 animate-fade-in-up">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <Heart className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground max-w-xs">
            Save your favourite fragrances to revisit them anytime
          </p>
          <Button asChild className="mt-8 rounded-full px-8" size="lg">
            <Link to="/products">Explore Fragrances</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wishlistProducts.map((product) => {
              const price = Number(product.price);
              const comparePrice = product.comparePrice
                ? Number(product.comparePrice)
                : null;
              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-500 hover:shadow-luxury-lg animate-scale-in"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${product.slug}`}
                    className="relative aspect-[3/4] overflow-hidden bg-muted"
                  >
                    <img
                      src={product.image || "/images/perfume1.jpg"}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/15" />

                    {/* Quick add overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        className="w-full rounded-full h-9 bg-white/95 text-slate-900 hover:bg-white text-xs font-medium shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                        Add to Bag
                      </Button>
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => toggle(product.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 dark:bg-black/50 p-2 backdrop-blur text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                    title="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                  </button>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-4 pt-3">
                    {product.brand && (
                      <p className="text-[10px] font-medium text-gold-600 dark:text-gold-400 uppercase tracking-[0.15em]">
                        {product.brand}
                      </p>
                    )}
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="mt-1 text-sm font-medium text-foreground line-clamp-1 hover:text-gold-700 dark:hover:text-gold-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold">
                          ${price.toFixed(2)}
                        </span>
                        {comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggle(product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile add-all CTA */}
          {wishlistProducts.length > 1 && (
            <div className="mt-8 sm:hidden">
              <Button
                className="w-full rounded-full"
                size="lg"
                onClick={handleAddAllToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Bag ({wishlistProducts.length} items)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
