import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  Heart,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  ChevronRight,
  RotateCcw,
  Zap,
  Package,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentStore } from "@/store/recentStore";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
 
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("50 ml");
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggle } = useWishlistStore();
  const addRecent = useRecentStore((s) => s.add);
 
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(slug || "");
  const { data: related } = trpc.product.listProducts.useQuery(
    { category: product?.category?.slug, limit: 6 },
    { enabled: !!product }
  );
 
  const price = Number(product?.price || 0);
  const liked = isInWishlist(product?.id || 0);
 
  const sizePrices = useMemo(() => {
    switch (price) {
      case 449: return { "30 ml": 199, "50 ml": 299, "100 ml": 449 };
      case 429: return { "30 ml": 189, "50 ml": 289, "100 ml": 429 };
      case 419: return { "30 ml": 189, "50 ml": 279, "100 ml": 419 };
      case 399: return { "30 ml": 179, "50 ml": 269, "100 ml": 399 };
      case 389: return { "30 ml": 169, "50 ml": 259, "100 ml": 389 };
      case 379: return { "30 ml": 169, "50 ml": 249, "100 ml": 379 };
      case 359: return { "30 ml": 159, "50 ml": 239, "100 ml": 359 };
      case 479: return { "30 ml": 209, "50 ml": 319, "100 ml": 479 };
      case 549: return { "30 ml": 249, "50 ml": 379, "100 ml": 549 };
      default:
        return {
          "30 ml": Math.round(price * 0.44),
          "50 ml": Math.round(price * 0.67),
          "100 ml": price
        };
    }
  }, [price]);
 
  const currentUnitPrice = (sizePrices as any)[selectedSize] || price;
  const totalPrice = currentUnitPrice * quantity;
 
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => toast.success("Added to cart"),
  });
 
  useEffect(() => {
    if (product) {
      addRecent(product as any);
      window.scrollTo(0, 0);
    }
  }, [product, addRecent]);
 
  const imageGallery = useMemo(() => {
    const gallery: string[] = [];
    if (product?.image) gallery.push(product.image);
    if (product?.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          parsed.forEach((img: string) => {
            if (img && !gallery.includes(img)) gallery.push(img);
          });
        }
      } catch {}
    }
    if (gallery.length === 0) gallery.push("/images/bottle_shot.png");
    return gallery;
  }, [product]);
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] animate-pulse">
        <div className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-6">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-12 w-3/4 bg-gray-200 rounded" />
              <div className="h-32 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h1 className="text-3xl font-serif font-bold text-[#2D241E]">Product Not Found</h1>
        <Button asChild className="mt-8 rounded-full bg-[#2D241E]">
          <Link to="/products">Back to Collection</Link>
        </Button>
      </div>
    );
  }
 
  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: product.id, quantity });
    addItem({
      productId: product.id,
      quantity,
      name: `${product.name} (${selectedSize})`,
      price: currentUnitPrice,
      image: product.image || "",
    });
  };
 
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
 
      {/* BREADCRUMBS */}
      <div className="container mx-auto px-6 py-6">
        <nav className="flex items-center gap-2 text-[11px] text-[#A89080]">
          <Link to="/" className="hover:text-[#2D241E] transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-[#2D241E] transition-colors">Fragrance</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#2D241E]">{product.name}</span>
        </nav>
      </div>
 
      {/* MAIN PRODUCT SECTION */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
 
          {/* LEFT — Image + Thumbnails */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative bg-white rounded-2xl overflow-hidden border border-[#EDE8E0]" style={{ aspectRatio: "4/3", maxHeight: "480px" }}>
              {/* Prev / Next arrows */}
              <button className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center z-10 text-[#2D241E] hover:bg-[#F5F1EB] transition-colors">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center z-10 text-[#2D241E] hover:bg-[#F5F1EB] transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
              <img
                src={imageGallery[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
 
            {/* Thumbnails row */}
            <div className="flex items-center gap-3">
              <button className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <ChevronRight className="h-3 w-3 rotate-180 text-[#2D241E]" />
              </button>
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i % imageGallery.length)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all bg-white p-1.5 flex-shrink-0 ${
                    selectedImage === i % imageGallery.length
                      ? "border-[#C5A059]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imageGallery[i % imageGallery.length] || "/images/bottle_shot.png"}
                    alt="thumb"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
              <button className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm ml-auto">
                <ChevronRight className="h-3 w-3 text-[#2D241E]" />
              </button>
            </div>
          </div>
 
          {/* RIGHT — Details */}
          <div className="flex flex-col gap-5">
 
            {/* Brand + Name + Stars */}
            <div>
              <p className="text-sm font-serif italic text-[#C5A059] mb-1">
                {product.brand || "Maison Francis Kurkdjian"}
              </p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D241E] leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex text-[#C5A059]">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <span className="text-[11px] text-[#A89080]">11 reviews</span>
              </div>
            </div>
 
            {/* Short Description */}
            <div className="py-4 border-t border-b border-[#EDE8E0]">
              <p className="text-[13px] text-[#7A6A5A] leading-[1.9] font-light italic">
                {product.description
                  ? product.description.substring(0, 160) + "\u2026"
                  : "A warm, sensual journey — creamy sandalwood entwined with spicy cardamom, leaving an irresistible trail of golden warmth on the skin."}
              </p>
            </div>
 
            {/* Size Selection */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2D241E] mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(sizePrices) as [string, number][]).map(([size, sPrice]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-lg text-[11px] font-semibold tracking-wide border transition-all text-center min-w-[72px] ${
                      selectedSize === size
                        ? "bg-[#2D241E] text-white border-[#2D241E]"
                        : "bg-white text-[#2D241E] border-[#D9D0C6] hover:border-[#C5A059]"
                    }`}
                  >
                    <div>{size}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedSize === size ? "text-white/70" : "text-[#C5A059]"}`}>
                      {sPrice.toFixed(0)} MAD
                    </div>
                  </button>
                ))}
              </div>
            </div>
 
            {/* Delivery Features — 2x2 grid like image */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2D241E] mb-3">Delivery</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Package, label: "Got it shipped" },
                  { icon: RotateCcw, label: "Auto-replenish" },
                  { icon: Zap, label: "Fast delivery" },
                  { icon: Package, label: "Pick up in store" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-[#EDE8E0]">
                    <item.icon className="h-4 w-4 text-[#A89080] flex-shrink-0" />
                    <span className="text-[11px] text-[#2D241E] font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Quantity row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#D9D0C6] rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-9 w-9 flex items-center justify-center hover:bg-[#F5F1EB] transition-colors"
                >
                  <Minus className="h-3.5 w-3.5 text-[#2D241E]" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#2D241E]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-9 w-9 flex items-center justify-center hover:bg-[#F5F1EB] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-[#2D241E]" />
                </button>
              </div>
            </div>
 
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-[#2D241E]">{totalPrice.toFixed(0)} MAD</span>
              <span className="text-sm text-[#A89080] mb-1">{selectedSize}</span>
            </div>
 
            {/* Add to Cart + Wishlist */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 h-12 rounded-full bg-[#5C4A3A] hover:bg-[#2D241E] text-white font-semibold tracking-wide transition-all shadow-md text-sm"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to cart
              </Button>
              <button
                onClick={() => toggle(product.id)}
                className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all ${
                  liked
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white border-[#D9D0C6] text-[#2D241E] hover:border-[#C5A059]"
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>
 
            {/* Availability */}
            <p className="text-[11px] text-[#A89080] flex items-center gap-1.5 cursor-pointer hover:text-[#2D241E] transition-colors">
              Availability in stores
              <ChevronRight className="h-3 w-3" />
            </p>
          </div>
        </div>
      </section>
 
      {/* TABS SECTION */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent gap-0 h-auto rounded-none p-0 mb-10 overflow-x-auto border-0">
              {[
                { label: "Description", value: "description" },
                { label: "Ingredients", value: "ingredients" },
                { label: "About the brand", value: "about" },
                { label: "Review (11)", value: "reviews" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none px-6 py-3 text-[11px] uppercase tracking-widest whitespace-nowrap border border-[#D9D0C6] -ml-px first:ml-0 font-medium text-[#A89080] hover:bg-[#8B6B4E]/10 hover:text-[#5C4A3A] transition-colors data-[state=active]:bg-[#8B6B4E]/15 data-[state=active]:text-[#5C4A3A] data-[state=active]:font-bold data-[state=active]:border-[#5C4A3A] data-[state=active]:z-10 data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
 
            {/* Description Tab — table style like image */}
            <TabsContent value="description">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-0">
                  {[
                    { label: "Types", val: "Eau de Parfum" },
                    { label: "For whom", val: "Unisex" },
                    { label: "Fragrance family", val: product.scentNotes ? undefined : "Floral & oriental" },
                    { label: "Season", val: "Winter" },
                    { label: "Brand", val: product.brand || "Maison Francis Kurkdjian" },
                    { label: "Perfumer", val: "Francis Kurkdjian" },
                    { label: "Year of creation", val: "2015" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                      <span className="text-[12px] text-[#A89080]">{row.label}</span>
                      <span className="text-[12px] font-medium text-[#2D241E]">{row.val}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-[#666666] leading-[2]">{product.description}</p>
                </div>
              </div>
            </TabsContent>
 
            {/* Ingredients Tab — Top / Middle / Base notes columns */}
            <TabsContent value="ingredients">
              <div className="grid grid-cols-3 gap-8 max-w-2xl">
                {[
                  { num: "1", label: "Top notes", notes: ["Saffron", "Jasmine"] },
                  { num: "2", label: "Middle notes", notes: ["Amberwood", "Ambergris"] },
                  { num: "3", label: "Base notes", notes: ["Spruce resin", "Cedar"] },
                ].map((col, i) => (
                  <div key={i}>
                    <div className="h-8 w-8 rounded-full bg-[#F5F1EB] flex items-center justify-center mb-3">
                      <span className="text-[12px] font-bold text-[#2D241E]">{col.num}</span>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2D241E] mb-3">{col.label}</p>
                    {col.notes.map((note, j) => (
                      <p key={j} className="text-sm text-[#A89080] leading-7">{note}</p>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>
 
            {/* About the brand Tab */}
            <TabsContent value="about">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm text-[#666666] leading-[2]">
                  Maison Francis Kurkdjian was born in 2009 from the encounter of two ambitious men: Francis Kurkdjian and Marc Chaya. 
                  Co-founder and President of the fragrance house, Francis Kurkdjian is a renowned perfumer with scores of successful creations. Together, they have created a sensual, generous and multi-faceted landscape of olfactory freedom that has become a new emblem of French know-how and lifestyle.
                </p>
                <p className="text-sm text-[#666666] leading-[2]">
                  Baccarat Rouge 540 eau de parfum is born from the encounter between Francis Kurkdjian and Baccarat to celebrate the crystal manufacturer's 250th anniversary. It releases a poetic alchemy, a highly condensed and graphic olfactory signature.
                </p>
              </div>
            </TabsContent>
 
            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="space-y-6 max-w-3xl">
                {[
                  { name: "Sophie M.", date: "March 2025", rating: 5, text: "Absolutely mesmerizing. The sillage lasts all day and I receive compliments every single time I wear it. A true masterpiece." },
                  { name: "James K.", date: "February 2025", rating: 5, text: "Worth every penny. The sandalwood base is creamy and smooth, and the spicy cardamom opening is addictive. My signature scent." },
                  { name: "Layla R.", date: "January 2025", rating: 4, text: "Gorgeous fragrance, very long-lasting. I gave 4 stars only because the bottle is smaller than I expected, but the scent itself is divine." },
                  { name: "Marco D.", date: "December 2024", rating: 5, text: "I ordered the 50ml and I'm already thinking about the 100ml. Rich, warm, sophisticated — exactly what a luxury perfume should smell like." },
                  { name: "Amina B.", date: "November 2024", rating: 5, text: "I've been searching for my perfect winter fragrance for years. This is it. Warm, enveloping, and incredibly elegant on the skin." },
                  { name: "Thomas W.", date: "October 2024", rating: 4, text: "Impressive longevity and projection. The oud and sandalwood combination is expertly balanced. Great for evening occasions." },
                ].map((review, i) => (
                  <div key={i} className="flex gap-5 pb-6 border-b border-gray-100 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-[#8B6B4E]/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-bold text-[#5C4A3A]">{review.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-semibold text-[#2D241E]">{review.name}</span>
                        <span className="text-[11px] text-[#A89080]">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < review.rating ? "fill-[#C5A059] text-[#C5A059]" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-[13px] text-[#666666] leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
 
      {/* SIMILAR FRAGRANCES */}
      {related && related.items.length > 0 && (
        <section className="py-20 container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-serif font-bold text-[#2D241E]">Similar<br />fragrances</h2>
            <div className="flex gap-2 ml-auto">
              <button className="h-9 w-9 rounded-full border border-[#D9D0C6] bg-white flex items-center justify-center hover:bg-[#F5F1EB] transition-colors">
                <ChevronRight className="h-4 w-4 rotate-180 text-[#2D241E]" />
              </button>
              <button className="h-9 w-9 rounded-full border border-[#D9D0C6] bg-white flex items-center justify-center hover:bg-[#F5F1EB] transition-colors">
                <ChevronRight className="h-4 w-4 text-[#2D241E]" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {related.items.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
 
      {/* NEWSLETTER */}
      <section className="bg-[#FDFBF7] py-20 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center max-w-md">
          <h3 className="text-lg font-serif font-bold text-[#2D241E] uppercase tracking-widest mb-2">Newsletter</h3>
          <p className="text-[11px] text-[#A89080] mb-6 leading-relaxed">
            Be the first to know about all discounts, offers and events weekly in our mailbox.<br />
            Unsubscribe whenever you like with one click.
          </p>
          <div className="flex items-center border-b border-[#2D241E] pb-2 gap-3">
            <Mail className="h-4 w-4 text-[#A89080] flex-shrink-0" />
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent flex-1 text-sm outline-none text-[#2D241E] placeholder:text-[#C5B8A8]"
            />
            <button className="px-5 py-2 rounded-full bg-[#5C4A3A] text-white text-[11px] font-semibold tracking-wide hover:bg-[#2D241E] transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}