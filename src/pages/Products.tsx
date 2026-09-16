import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Star, 
  Heart, 
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/providers/trpc";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

// Color helper function mapping perfume names to aesthetic color groups deterministically
const getProductColor = (productName: string): "Orange" | "Purple" | "Skin-Blue" | "White" | "Yellow" => {
  const hash = productName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors: ("Orange" | "Purple" | "Skin-Blue" | "White" | "Yellow")[] = ["Orange", "Purple", "Skin-Blue", "White", "Yellow"];
  return colors[hash % colors.length];
};

// Size price mappings matching detail pages exactly
const getExactPrice = (basePrice: number, size: string) => {
  if (size === "30 ml") {
    switch (basePrice) {
      case 449: return 199;
      case 429: return 189;
      case 399: return 179;
      case 389: return 169;
      case 479: return 209;
      case 419: return 189;
      case 379: return 169;
      case 359: return 159;
      case 549: return 249;
      default: return Math.round(basePrice * 0.44);
    }
  }
  if (size === "50 ml") {
    switch (basePrice) {
      case 449: return 299;
      case 429: return 289;
      case 399: return 269;
      case 389: return 259;
      case 479: return 319;
      case 419: return 279;
      case 379: return 249;
      case 359: return 239;
      case 549: return 379;
      default: return Math.round(basePrice * 0.67);
    }
  }
  return basePrice; // 100 ml
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Advanced Filter states
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [sort, setSort] = useState<string>("default");

  // Cart & Wishlist hooks
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle } = useWishlistStore();
  const utils = trpc.useUtils();
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      toast.success("Added to cart");
    },
  });

  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const featured = searchParams.get("featured") === "true" ? true : undefined;
  
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) ? 1 : pageParam;

  // Load all items (limit 100 ensures we load all seeded 50 perfumes instantly)
  const { data: categories } = trpc.product.listCategories.useQuery();
  const { data: productsData, isLoading } = trpc.product.listProducts.useQuery({
    limit: 100,
  });

  const allProducts = productsData?.items || [];

  // Reset pagination on filter change
  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  useEffect(() => {
    setPage(1);
  }, [category, search, selectedColors, selectedSizes, priceRange, sort]);

  // Helper count selectors
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { homme: 0, femme: 0, mixte: 0 };
    allProducts.forEach(p => {
      const slug = p.category?.slug || "";
      if (slug in counts) counts[slug]++;
    });
    return counts;
  }, [allProducts]);

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = { Orange: 0, Purple: 0, "Skin-Blue": 0, White: 0, Yellow: 0 };
    allProducts.forEach(p => {
      const col = getProductColor(p.name);
      if (col in counts) counts[col]++;
    });
    return counts;
  }, [allProducts]);

  const sizeCounts = useMemo(() => {
    return { "30 ml": allProducts.length, "50 ml": allProducts.length, "100 ml": allProducts.length };
  }, [allProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (category && product.category?.slug !== category) return false;
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (featured && !product.isFeatured) return false;

      // Color filter
      if (selectedColors.length > 0) {
        const col = getProductColor(product.name);
        if (!selectedColors.includes(col)) return false;
      }

      // Price filter based on selected size (fallback to base 100ml price)
      const basePrice = Number(product.price);
      const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
      const currentPrice = getExactPrice(basePrice, activeSize);
      if (currentPrice < priceRange[0] || currentPrice > priceRange[1]) return false;

      return true;
    });
  }, [allProducts, category, search, featured, selectedColors, selectedSizes, priceRange]);

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    if (sort === "price-asc") {
      items.sort((a, b) => {
        const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
        return getExactPrice(Number(a.price), activeSize) - getExactPrice(Number(b.price), activeSize);
      });
    } else if (sort === "price-desc") {
      items.sort((a, b) => {
        const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
        return getExactPrice(Number(b.price), activeSize) - getExactPrice(Number(a.price), activeSize);
      });
    } else if (sort === "rating") {
      items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sort === "popularity") {
      items.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
    return items;
  }, [filteredProducts, sort, selectedSizes]);

  // Pagination bounds
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, page]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 600]);
    setSort("default");
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    setSearchParams(params);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
    const price = getExactPrice(Number(product.price), activeSize);

    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
    addItem({
      productId: product.id,
      slug: product.slug,
      quantity: 1,
      name: `${product.name} (${activeSize})`,
      price: price,
      image: product.image || "",
    });
  };

  const updateCategoryFilter = (slug: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const toggleColorFilter = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const hasActiveFilters = category || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 600;

  const pageTitle = search
    ? `Results for "${search}"`
    : featured
      ? "Featured Collection"
      : category
        ? categories?.find((c) => c.slug === category)?.name || "Products"
        : "All Fragrances";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 bg-[#FDFBF9] dark:bg-background text-foreground transition-colors duration-300 min-h-screen">
      {/* ═══ TOP SHOP HEADER ═══ */}
      <div className="text-center mb-10 border-b border-[#2D241E]/10 dark:border-border pb-8">
        <p className="text-[10px] font-medium tracking-[0.4em] text-[#C5A059] uppercase mb-2">
          {featured ? "Handpicked Selection" : "The Parfumeluxe Vault"}
        </p>
        <h1 className="text-4xl font-serif font-bold text-[#2D241E] dark:text-foreground tracking-tight">
          {pageTitle}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">
          {sortedProducts.length} premium {sortedProducts.length === 1 ? "fragrance" : "fragrances"} discovered
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* ═══ SIDEBAR FILTERS ═══ */}
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          <div className="sticky top-24 space-y-8">
            <SidebarFilters
              categories={categories || []}
              currentCategory={category}
              categoryCounts={categoryCounts}
              colorCounts={colorCounts}
              sizeCounts={sizeCounts}
              selectedColors={selectedColors}
              selectedSizes={selectedSizes}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              updateCategoryFilter={updateCategoryFilter}
              toggleColorFilter={toggleColorFilter}
              toggleSizeFilter={toggleSizeFilter}
              clearFilters={clearFilters}
              hasActiveFilters={!!hasActiveFilters}
            />
          </div>
        </aside>

        {/* Mobile Sidebar Trigger */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-card p-6 shadow-2xl overflow-y-auto animate-slide-left space-y-8 border-l border-border">
              <div className="flex items-center justify-between border-b pb-4 border-border">
                <h2 className="font-serif text-lg font-bold text-[#2D241E] dark:text-foreground">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="dark:text-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarFilters
                categories={categories || []}
                currentCategory={category}
                categoryCounts={categoryCounts}
                colorCounts={colorCounts}
                sizeCounts={sizeCounts}
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                updateCategoryFilter={updateCategoryFilter}
                toggleColorFilter={toggleColorFilter}
                toggleSizeFilter={toggleSizeFilter}
                clearFilters={clearFilters}
                hasActiveFilters={!!hasActiveFilters}
              />
            </div>
          </div>
        )}

        {/* ═══ MAIN GRID/CATALOG AREA ═══ */}
        <div className="flex-1">
          {/* Main Controls Panel */}
          <div className="bg-white dark:bg-card border border-[#2D241E]/10 dark:border-border rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden rounded-full border-gray-200 dark:border-border dark:bg-slate-900 dark:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter Options
              </Button>

              {/* Grid / List Layout toggles */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-50 dark:bg-slate-900 p-1 rounded-lg border border-gray-100 dark:border-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-[#2D241E] dark:bg-[#C5A059] text-white dark:text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-all ${viewMode === "list" ? "bg-[#2D241E] dark:bg-[#C5A059] text-white dark:text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Results counter */}
              <p className="text-xs font-serif uppercase tracking-widest text-[#2D241E]/60 dark:text-slate-400">
                Showing {sortedProducts.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sortedProducts.length)} of {sortedProducts.length} results
              </p>
            </div>

            {/* Right sorting controls */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs uppercase tracking-wider font-semibold border-gray-200 dark:border-border rounded-lg p-2 bg-white dark:bg-slate-900 text-[#2D241E] dark:text-foreground focus:ring-0 focus:outline-none focus:border-[#C5A059]"
              >
                <option value="default">Default Sorting</option>
                <option value="popularity">Sort by Popularity</option>
                <option value="rating">Sort by Average Rating</option>
                <option value="price-asc">Sort by Price: Low to High</option>
                <option value="price-desc">Sort by Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loader state */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white dark:bg-card border border-border rounded-xl p-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
                <Filter className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2D241E] dark:text-foreground">No Fragrances Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or clear all parameters to start fresh.</p>
              <Button variant="outline" className="mt-6 rounded-full dark:border-border dark:text-foreground" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => {
                const basePrice = Number(product.price);
                const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
                const displayPrice = getExactPrice(basePrice, activeSize);
                const comparePrice = product.comparePrice ? getExactPrice(Number(product.comparePrice), activeSize) : null;
                const discount = comparePrice ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100) : null;
                const liked = isInWishlist(product.id);
                const color = getProductColor(product.name);

                return (
                  <div key={product.id} className="group relative flex flex-col overflow-hidden bg-white dark:bg-card border border-[#2D241E]/10 dark:border-border rounded-xl transition-all duration-500 hover:shadow-luxury-lg">
                    {/* Image Box */}
                    <Link to={`/product/${product.slug}`} className="relative aspect-square block bg-slate-50 dark:bg-slate-900/50 p-4 overflow-hidden border-b border-[#2D241E]/5 dark:border-border/20">
                      <img
                        src={product.image || "/images/perfume1.jpg"}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                      />

                      {/* Hot Sale Badge */}
                      {discount && (
                        <span className="absolute left-3 top-3 bg-red-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase">
                          SALE
                        </span>
                      )}

                      {/* Dynamic Mock Countdown for Hot Deals */}
                      {discount && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#2D241E]/95 dark:bg-[#1A1816]/95 backdrop-blur-sm text-white dark:text-slate-300 py-1 text-center text-[8px] font-mono tracking-wider uppercase">
                          deal remaining: 04d : 12h : 15m
                        </div>
                      )}
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggle(product.id);
                      }}
                      className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur border border-slate-100 dark:border-slate-800 transition-all duration-300 ${
                        liked ? "bg-red-50 text-red-500" : "bg-white/80 dark:bg-black/50 text-muted-foreground hover:bg-white hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-red-500 scale-110" : ""}`} />
                    </button>

                    {/* Info and Actions */}
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">{product.brand || "Oud Royale"}</span>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="mt-1 text-sm font-semibold text-[#2D241E] dark:text-foreground line-clamp-1 transition-colors group-hover:text-[#C5A059]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating stars */}
                      <div className="flex text-amber-400 my-1.5 gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= Math.round(Number(product.rating || 5)) ? "fill-current" : "text-gray-200 dark:text-slate-800"}`}
                          />
                        ))}
                      </div>

                      {/* Color Tag Indicator */}
                      <span className="text-[8px] tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        Scent Profile: <span className="text-slate-600 dark:text-slate-300">{color}</span>
                      </span>

                      {/* Bottom Add & Price row */}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-900 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[9px] font-bold uppercase tracking-widest rounded border-[#2D241E]/20 dark:border-border hover:bg-[#2D241E] hover:text-white dark:text-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          ADD TO CART
                        </Button>
                        
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#2D241E] dark:text-foreground">
                            {displayPrice} MAD
                          </p>
                          {comparePrice && (
                            <p className="text-[10px] text-red-500 line-through">
                              {comparePrice} MAD
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-6">
              {paginatedProducts.map((product) => {
                const basePrice = Number(product.price);
                const activeSize = selectedSizes.length === 1 ? selectedSizes[0] : "100 ml";
                const displayPrice = getExactPrice(basePrice, activeSize);
                const comparePrice = product.comparePrice ? getExactPrice(Number(product.comparePrice), activeSize) : null;
                const liked = isInWishlist(product.id);

                return (
                  <div key={product.id} className="group relative flex flex-col sm:flex-row bg-white dark:bg-card border border-[#2D241E]/10 dark:border-border rounded-xl overflow-hidden transition-all hover:shadow-luxury-lg p-4 gap-6">
                    {/* Left: Image Container */}
                    <div className="w-full sm:w-44 aspect-square shrink-0 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg relative flex items-center justify-center">
                      <img src={product.image || "/images/perfume1.jpg"} alt={product.name} className="h-full w-full object-contain" />
                      {product.comparePrice && (
                        <span className="absolute left-3 top-3 bg-red-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded uppercase">
                          SALE
                        </span>
                      )}
                    </div>

                    {/* Right: details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">{product.brand || "Oud Royale"}</span>
                          <h3 className="font-serif text-lg font-bold text-[#2D241E] dark:text-foreground mt-0.5">{product.name}</h3>
                          
                          {/* Rating stars */}
                          <div className="flex text-amber-400 mt-1 mb-3 gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= Math.round(Number(product.rating || 5)) ? "fill-current" : "text-gray-200 dark:text-slate-800"}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggle(product.id)}
                          className={`rounded-full p-2 border transition-all ${liked ? "bg-red-50 border-red-200 text-red-500" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-muted-foreground dark:text-slate-400 hover:text-red-500"}`}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">{product.description || "Indulge in a premium fragrance experience carefully crafted by Moroccan perfumery traditions. Each note represents luxury scent definitions."}</p>

                      {/* Price & Action row */}
                      <div className="mt-auto border-t border-slate-50 dark:border-slate-900 pt-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-baseline gap-2">
                          <p className="text-lg font-bold text-[#2D241E] dark:text-foreground">
                            {displayPrice} MAD
                          </p>
                          {comparePrice && (
                            <p className="text-xs text-red-500 line-through">
                              {comparePrice} MAD
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline" className="rounded uppercase text-[10px] tracking-wider px-4 dark:border-border dark:text-foreground">
                            <Link to={`/product/${product.slug}`}>DETAILS</Link>
                          </Button>
                          <Button size="sm" className="rounded bg-[#2D241E] dark:bg-primary text-white dark:text-primary-foreground hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A]/80 uppercase text-[10px] tracking-wider px-4" onClick={(e) => handleAddToCart(e, product)}>
                            ADD TO CART
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ BOTTOM PAGINATION ═══ */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-[#2D241E]/10 dark:border-border pt-6">
              <p className="text-xs uppercase tracking-widest text-[#2D241E]/60 dark:text-slate-400 font-semibold">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 w-9 p-0 dark:border-border dark:text-foreground dark:bg-slate-900"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  &larr;
                </Button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${isActive ? "bg-[#2D241E] dark:bg-[#C5A059] text-white dark:text-slate-950 shadow-sm" : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-border text-[#2D241E] dark:text-foreground"}`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 w-9 p-0 dark:border-border dark:text-foreground dark:bg-slate-900"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ EXQUISITE SIDEBAR COMPONENT ═══
interface SidebarProps {
  categories: { id: number; name: string; slug: string }[];
  currentCategory: string | undefined;
  categoryCounts: Record<string, number>;
  colorCounts: Record<string, number>;
  sizeCounts: Record<string, number>;
  selectedColors: string[];
  selectedSizes: string[];
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  updateCategoryFilter: (slug: string | undefined) => void;
  toggleColorFilter: (c: string) => void;
  toggleSizeFilter: (s: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

function SidebarFilters({
  categories,
  currentCategory,
  categoryCounts,
  colorCounts,
  sizeCounts,
  selectedColors,
  selectedSizes,
  priceRange,
  setPriceRange,
  updateCategoryFilter,
  toggleColorFilter,
  toggleSizeFilter,
  clearFilters,
  hasActiveFilters
}: SidebarProps) {
  
  // Sidebar Promo Product Dahab Al Shams
  const promoProduct = {
    name: "Dahab Al Shams",
    slug: "dahab-al-shams",
    image: "/images/al shamss.png",
    price: 299
  };

  return (
    <div className="space-y-8 bg-white dark:bg-card border border-[#2D241E]/10 dark:border-border rounded-xl p-5 shadow-sm text-[#2D241E] dark:text-foreground">
      
      {/* 1. Category filter list widget */}
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#2D241E]/10 dark:border-border text-[#2D241E] dark:text-foreground">
          Categories
        </h3>
        <div className="space-y-1.5">
          {/* All Categories list option */}
          <button
            onClick={() => updateCategoryFilter(undefined)}
            className={`flex items-center justify-between w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all ${
              !currentCategory
                ? "bg-[#2D241E] dark:bg-[#C5A059] text-white dark:text-slate-950 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-[#2D241E] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!currentCategory ? "bg-white/20 dark:bg-black/30" : "bg-slate-100 dark:bg-slate-800/70"}`}>
              {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
            </span>
          </button>
          
          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            const count = categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => updateCategoryFilter(cat.slug)}
                className={`flex items-center justify-between w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#2D241E] dark:bg-[#C5A059] text-white dark:text-slate-950 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#2D241E] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 dark:bg-black/30" : "bg-slate-100 dark:bg-slate-800/70"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color check list widget */}
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#2D241E]/10 dark:border-border text-[#2D241E] dark:text-foreground">
          Filter By Color
        </h3>
        <div className="space-y-2.5">
          {["Orange", "Purple", "Skin-Blue", "White", "Yellow"].map((color) => {
            const isChecked = selectedColors.includes(color);
            const count = colorCounts[color] || 0;
            const dotStyles = 
              color === "Orange" ? "bg-orange-500" :
              color === "Purple" ? "bg-purple-500" :
              color === "Skin-Blue" ? "bg-blue-400" :
              color === "White" ? "bg-slate-100 border border-slate-300 dark:border-slate-700" :
              "bg-yellow-400";

            return (
              <label key={color} className="flex items-center justify-between cursor-pointer group text-xs text-slate-600 dark:text-slate-400 hover:text-[#2D241E] dark:hover:text-white">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColorFilter(color)}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#2D241E] dark:text-[#C5A059] bg-white dark:bg-slate-900 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <div className={`h-2.5 w-2.5 rounded-full ${dotStyles}`} />
                  <span className={isChecked ? "font-semibold text-[#2D241E] dark:text-foreground" : ""}>{color}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-[#2D241E] dark:group-hover:text-white">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Slider pricing widget */}
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#2D241E]/10 dark:border-border text-[#2D241E] dark:text-foreground">
          Filter By Price
        </h3>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          max={600}
          step={10}
          className="w-full"
        />
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>{priceRange[0]} MAD</span>
          <span>{priceRange[1]} MAD</span>
        </div>
      </div>

      {/* 4. Sizes checkbox list widget */}
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#2D241E]/10 dark:border-border text-[#2D241E] dark:text-foreground">
          Filter By Size
        </h3>
        <div className="space-y-2.5">
          {["30 ml", "50 ml", "100 ml"].map((size) => {
            const isChecked = selectedSizes.includes(size);
            const count = sizeCounts[size] || 0;
            return (
              <label key={size} className="flex items-center justify-between cursor-pointer group text-xs text-slate-600 dark:text-slate-400 hover:text-[#2D241E] dark:hover:text-white">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSizeFilter(size)}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#2D241E] dark:text-[#C5A059] bg-white dark:bg-slate-900 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span className={isChecked ? "font-semibold text-[#2D241E] dark:text-foreground" : ""}>{size}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-[#2D241E] dark:group-hover:text-white">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Top featured products compact widget */}
      <div>
        <h3 className="font-serif text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-[#2D241E]/10 dark:border-border text-[#2D241E] dark:text-foreground">
          Top Products
        </h3>
        <div className="space-y-4">
          {[
            { name: "Sultan Al Layl", slug: "sultan-al-layl", price: 449, image: "/images/sultan.png", rating: 5 },
            { name: "Warda Al Malika", slug: "warda-al-malika", price: 419, image: "/images/almalika.png", rating: 5 },
            { name: "Al Asl Al Malaki", slug: "al-asl-al-malaki", price: 549, image: "/images/asal_elmalaki.png", rating: 5 }
          ].map((prod) => (
            <Link key={prod.slug} to={`/product/${prod.slug}`} className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded bg-slate-50 dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                <img src={prod.image} alt={prod.name} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#2D241E] dark:text-foreground truncate group-hover:text-[#C5A059]">{prod.name}</h4>
                <div className="flex text-amber-400 gap-0.5 mt-0.5">
                  {Array.from({ length: prod.rating }).map((_, i) => (
                    <Star key={i} className="h-2 w-2 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-[#2D241E] dark:text-foreground mt-0.5">{prod.price} MAD</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. Dynamic collection promo banner widget */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 dark:from-slate-900 to-orange-100 dark:to-amber-950/20 p-5 border border-amber-200/50 dark:border-slate-800/50 shadow-sm mt-4">
        <div className="absolute top-2 right-2 text-amber-400">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
        <span className="text-[8px] font-bold tracking-widest text-amber-800 dark:text-[#C5A059] uppercase">NEW COLLECTION</span>
        <h4 className="mt-0.5 font-serif text-base font-bold text-[#2D241E] dark:text-foreground leading-tight">{promoProduct.name}</h4>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">Experience golden warmth in every luxury mist.</p>
        <img src={promoProduct.image} alt="Promo Perfume" className="my-3 h-24 w-full object-contain transition-transform duration-500 hover:scale-110" />
        <Button asChild size="sm" className="w-full rounded bg-[#2D241E] dark:bg-primary text-white dark:text-primary-foreground hover:bg-[#1A1A1A] h-8 text-[9px] uppercase tracking-wider font-bold">
          <Link to={`/product/${promoProduct.slug}`}>EXPLORE NOW</Link>
        </Button>
      </div>

      {/* Clear Filters indicator Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full border-red-200 dark:border-border hover:bg-red-50 dark:hover:bg-slate-900 text-red-600 hover:text-red-700 h-8 text-[10px] uppercase font-bold tracking-wider"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
