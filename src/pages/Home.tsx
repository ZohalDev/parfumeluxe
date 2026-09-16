import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  ArrowRight, 
  Star, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  Clock,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"bestseller" | "new" | "top">("bestseller");
  const { data: productsData, isLoading } = trpc.product.listProducts.useQuery({
    limit: 8,
    featured: activeTab === "top" ? true : undefined,
  });

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 12, mins: 45, secs: 30 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stateful Slider Configuration
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [     
     {
      subtitle: "— The Royal Showroom —",
      title: "Oud Royale Masterpieces",
      italicWord: "Royal Collection",
      desc: "Indulge in our complete vault of fifty premium, hand-seeded Moroccan fragrances, meticulously crafted inside our gold marble laboratory.",
      lifestyleImg: "/images/tel7.png",
      bottleImg: "/images/al shamss.png"  ,
      tagTitle: "Authentic",
      tagSub: "Seeded Luxury",
      tagItalic: "Collection",
      link: "/products"
    },

    {
      subtitle: "— Scent of the Desert —",
      title: "Amir Al Sahara Majesty",
      italicWord: "Amir Al Sahara",
      desc: "Embark on an olfactory journey across warm sands. A robust, royal fragrance crafted with pure premium agarwood for the modern gentleman.",
      lifestyleImg: "/images/men27.png",
      bottleImg: "/images/amir_alsahra.png",
      tagTitle: "For Him",
      tagSub: "Premium 100%",
      tagItalic: "Seductive",
      link: "/product/amir-al-sahara"
    },
    {
      subtitle: "— Shared Passion —",
      title: "Kenz Al Janoub Elegance",
      italicWord: "Kenz Al Janoub",
      desc: "A timeless, harmonic unisex fragrance merging warm southern spices, fresh rose petals, and a deep gold amber base for both of you.",
      lifestyleImg: "/images/romantic.png",
      bottleImg: "/images/kanz eljanoub.png",
      tagTitle: "Unisex Scent",
      tagSub: "Formulated for",
      tagItalic: "Him & Her",
      link: "/product/kenz-al-janoub"
    },
      {
      subtitle: "— Since MMXXIV —",
      title: "Best Perfume Collection for You",
      italicWord: "Collection",
      desc: "Discover the Best Perfume Collection: Find Your Signature Scent Today. Unleash Your Essence with the Every Spritz.",
      lifestyleImg: "/images/hero_lifestyle.png",
      bottleImg: "/images/bottle_shot.png",
      tagTitle: "Our Unique",
      tagSub: "Product 100%",
      tagItalic: "Organic",
      link: "/products"
    },
    
  ];

  // Auto slide interval
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* 1. TOP HEADER BANNER */}
      <div className="relative bg-[#2D241E] text-white py-2.5 text-center text-[10px] tracking-[0.25em] uppercase overflow-hidden">
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-gold-400 animate-float" />
          Welcome to our online store — Free shipping over 1500 MAD
          <Sparkles className="h-3 w-3 text-gold-400 animate-float" style={{ animationDelay: '2s' }} />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent" />
      </div>

      {/* 2. HERO SECTION WITH STATEFUL SLIDER */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-12 pb-16 bg-[#FDFBF9] dark:bg-background transition-colors duration-300">
        
        {/* Left Arrow Navigation */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 z-20 p-2.5 rounded-full glass hover:shadow-gold-sm text-[#2D241E] dark:text-foreground transition-all duration-300 focus:outline-none hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right Arrow Navigation */}
        <button 
          onClick={nextSlide}
          className="absolute right-4 z-20 p-2.5 rounded-full glass hover:shadow-gold-sm text-[#2D241E] dark:text-foreground transition-all duration-300 focus:outline-none hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT CONTENT BLOCK */}
          <div key={`left-${currentSlide}`} className="z-10 animate-fade-in-up">
            <p className="text-[10px] font-medium tracking-[0.4em] text-gold-600 dark:text-gold-400 uppercase mb-6">
              {slides[currentSlide].subtitle}
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-[#2D241E] dark:text-foreground leading-[1.1] mb-8">
              {slides[currentSlide].title.split(slides[currentSlide].italicWord)[0]}
              <span className="italic font-normal text-gold-gradient block sm:inline">
                {slides[currentSlide].italicWord}
              </span>
              {slides[currentSlide].title.split(slides[currentSlide].italicWord)[1]}
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
              {slides[currentSlide].desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-10 h-14 bg-[#2D241E] dark:bg-primary text-white dark:text-primary-foreground hover:bg-[#1A1A1A] dark:hover:bg-primary/90 hover:shadow-gold-sm transition-all duration-300">
                <Link to={slides[currentSlide].link}>Buy Now</Link>
              </Button>
              <Button variant="ghost" size="lg" className="rounded-full px-10 h-14 text-[#2D241E] dark:text-foreground hover:bg-gold-500/10 group transition-all duration-300">
                Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 overflow-hidden ring-1 ring-gold-500/20">
                    <img src={`https://i.pravatar.cc/150?u=${i + currentSlide}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#2D241E] dark:text-foreground">Happy Customers</p>
                <div className="flex text-gold-500 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PICTURE BLOCK */}
          <div key={`right-${currentSlide}`} className="relative flex justify-center items-center">
            <div className="relative w-full max-w-lg aspect-[4/5]">
              {/* Lifestyle Image inside Oval Circle */}
              <div className="absolute top-0 right-0 w-[85%] h-[90%] rounded-full overflow-hidden border-[12px] border-white dark:border-slate-900 shadow-2xl animate-fade-in bg-slate-100 dark:bg-slate-950">
                <img 
                  src={slides[currentSlide].lifestyleImg} 
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Small Perfume Bottle */}
              <div className="absolute -bottom-6 -left-6 w-[55%] aspect-square rounded-full overflow-hidden border-[8px] border-white dark:border-slate-900 shadow-xl animate-scale-in bg-white dark:bg-slate-900 flex items-center justify-center p-4">
                <img 
                  src={slides[currentSlide].bottleImg} 
                  alt="Perfume Bottle representation"
                  className="h-full w-full object-contain hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Floating Organic label */}
              <div className="absolute top-10 right-[-10px] glass p-5 rounded-full shadow-gold-sm animate-float text-center select-none">
                <p className="text-[9px] font-bold uppercase tracking-tighter text-[#2D241E] dark:text-foreground">{slides[currentSlide].tagTitle}</p>
                <p className="text-[7px] text-muted-foreground uppercase">{slides[currentSlide].tagSub}</p>
                <p className="text-[9px] font-serif italic text-gold-600 dark:text-gold-400">{slides[currentSlide].tagItalic}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM DOTS SLIDE INDICATOR */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 glass px-5 py-2.5 rounded-full z-10">
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  currentSlide === idx 
                    ? "w-8 bg-gradient-to-r from-gold-500 to-gold-600" 
                    : "w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-gold-400/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2D241E] dark:text-foreground">
            {`0${currentSlide + 1}`} / {`0${slides.length}`}
          </span>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[12vw] font-serif italic text-[#2D241E]/5 dark:text-white/5 whitespace-nowrap select-none pointer-events-none z-0">
          essence unleashed
        </div>
      </section>

      {/* 3. TICKER SECTION */}
      <div className="relative bg-white dark:bg-card border-y border-gold-500/10 py-6 overflow-hidden transition-colors duration-300">
        <div className="flex whitespace-nowrap animate-marquee">
          {["Fragrance Defined", "Scent Of Elegance", "Perfume Essence", "Aroma Inspiration", "Signature Scent"].map((text, idx) => (
            <div key={idx} className="flex items-center mx-8">
              <span className="text-sm font-medium tracking-[0.2em] text-[#2D241E] dark:text-foreground uppercase transition-colors">{text}</span>
              <span className="mx-8 text-gold-500">✦</span>
            </div>
          ))}
          {/* Duplicate for infinite loop */}
          {["Fragrance Defined", "Scent Of Elegance", "Perfume Essence", "Aroma Inspiration", "Signature Scent"].map((text, idx) => (
            <div key={idx + 10} className="flex items-center mx-8">
              <span className="text-sm font-medium tracking-[0.2em] text-[#2D241E] dark:text-foreground uppercase transition-colors">{text}</span>
              <span className="mx-8 text-gold-500">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DEAL OF THE DAY (Countdown) */}
      <section className="py-16 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600 dark:text-gold-400 mb-2">Limited Time Only</p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D241E] dark:text-foreground uppercase tracking-widest transition-colors">Deal of the Day</h2>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
             <div className="flex gap-2">
                {Object.entries(timeLeft).map(([label, val]) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="glass rounded-xl w-14 h-14 flex items-center justify-center font-bold text-lg text-[#2D241E] dark:text-foreground shadow-gold-sm transition-all">
                      {val.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[8px] uppercase tracking-widest mt-1.5 text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="luxury-divider mb-10">
          <span className="text-gold-500 text-xs">✦</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)
          ) : (
            productsData?.items?.slice(0, 4).map((product) => (
              <div key={product.id} className="card-luxury p-4 group relative border border-transparent hover:border-gold-500/20 transition-all">
                <Badge className="absolute top-6 left-6 z-10 bg-gradient-to-r from-gold-500 to-gold-600 text-white border-0 rounded-full shadow-gold-sm">NEW</Badge>
                <Link to={`/product/${product.slug}`} className="block cursor-pointer">
                  <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-[#FDFBF7] dark:bg-slate-950/50">
                    <img src={product.image || "/images/bottle_shot.png"} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </Link>
                <div className="text-center">
                  <Link to={`/product/${product.slug}`} className="block hover:text-gold-600 dark:hover:text-gold-400 transition-colors cursor-pointer">
                    <h3 className="font-medium text-sm text-[#2D241E] dark:text-foreground truncate">{product.name}</h3>
                  </Link>
                  <div className="flex justify-center text-gold-500 my-2">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <p className="font-bold text-[#2D241E] dark:text-foreground">{Number(product.price).toFixed(0)} MAD</p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 w-[70%] rounded-full transition-all" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center uppercase tracking-tighter">Available: 45 / Sold: 12</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. PROMO BANNERS */}
      <section className="py-12 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative bg-[#F5F1EB] dark:bg-card rounded-2xl p-10 flex items-center overflow-hidden transition-colors group hover:shadow-gold-sm">
             <div className="z-10 w-1/2">
                <p className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase mb-2 tracking-[0.2em]">Top Sales Store</p>
                <h3 className="text-2xl font-serif font-bold text-[#2D241E] dark:text-foreground mb-4">Best Collection</h3>
                <p className="text-xs text-muted-foreground mb-6">Store standard engine <br />primo di consegna</p>
                <Link to="/products" className="inline-flex items-center gap-1 text-[10px] font-bold border-b border-[#2D241E] dark:border-foreground tracking-widest uppercase dark:text-foreground group/link hover:border-gold-500 hover:text-gold-600 transition-all">
                  SHOP NOW <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
             </div>
             <img src="/images/bottle_shot.png" alt="Perfume" className="absolute right-0 top-0 h-full w-1/2 object-contain py-4 transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="relative bg-[#2D241E] rounded-2xl p-10 flex items-center overflow-hidden group hover:shadow-gold-sm">
             <div className="z-10 w-1/2 text-white">
                <p className="text-[10px] font-bold text-gold-400 uppercase mb-2 tracking-[0.2em]">Exclusive Offer</p>
                <h3 className="text-2xl font-serif font-bold mb-4">Maybe You've <br />Earned It</h3>
                <p className="text-xs text-white/70 mb-6">Get extra 20% off for all <br />items with code OUD20</p>
                <Link to="/products" className="inline-flex items-center gap-1 text-[10px] font-bold border-b border-white tracking-widest uppercase group/link hover:border-gold-400 hover:text-gold-400 transition-all">
                  SHOP NOW <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
             </div>
             <img src="/images/banner_side1.png" alt="Perfume" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50 transition-all duration-700 group-hover:opacity-60 group-hover:scale-105" />
          </div>
        </div>
      </section>

      {/* 6. PRODUCT TABS */}
      <section className="py-16 container mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600 dark:text-gold-400 mb-2">Our Collection</p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D241E] dark:text-foreground tracking-wider">Discover Excellence</h2>
        </div>

        <div className="flex justify-center gap-3 mb-12">
          {["bestseller", "new", "top"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-400 ${
                activeTab === tab 
                ? "bg-[#2D241E] dark:bg-primary text-white dark:text-primary-foreground shadow-gold-sm" 
                : "glass text-[#2D241E] dark:text-foreground hover:shadow-gold-sm"
              }`}
            >
              {tab === "top" ? "Top Rated" : tab === "new" ? "New Arrivals" : "Bestseller"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
           {isLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)
          ) : (
            productsData?.items?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 7. TRUST BAR */}
      <div className="relative bg-gradient-to-r from-gold-500/5 via-gold-500/10 to-gold-500/5 py-14 border-y border-gold-500/15 overflow-hidden">
        <div className="noise absolute inset-0" />
        <div className="relative container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Global Delivery", desc: "Free shipping over 1500 MAD" },
            { icon: ShieldCheck, title: "Money Guarantee", desc: "30 days money back" },
            { icon: Headphones, title: "Online Support", desc: "We're here to assist 24/7" },
            { icon: Clock, title: "Working Hours", desc: "Mon - Sat: 9:00 - 20:00" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="h-14 w-14 rounded-full bg-white dark:bg-card flex items-center justify-center mb-4 shadow-gold-sm group-hover:shadow-gold transition-all duration-500 group-hover:scale-110">
                <item.icon className="h-6 w-6 text-gold-600 dark:text-gold-400" />
              </div>
              <h4 className="font-bold text-[#2D241E] dark:text-foreground text-sm uppercase tracking-wider">{item.title}</h4>
              <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. LATEST NEWS */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600 dark:text-gold-400 mb-2">From Our Atelier</p>
          <h2 className="text-3xl font-serif font-bold text-[#2D241E] dark:text-foreground uppercase tracking-widest transition-colors">Our Latest News</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {[
            {
              title: "The Art of Moroccan Scent Making: Crafting Sultan Al Layl",
              desc: "Discover how we blend rare midnight ouds and Atlas cedarwood to create our signature Sultan Al Layl fragrance, a tribute to Moroccan royalty.",
              image: "/images/sultan.png",
              tag: "CRAFTMANSHIP"
            },
            {
              title: "Selecting the Perfect Rose: The Secret of Al Malika",
              desc: "A deep dive into the valley of Kelaat M'gouna, where the rare roses for Warda Al Malika are hand-harvested at dawn for ultimate purity.",
              image: "/images/almalika.png",
              tag: "HARVEST"
            },
            {
              title: "The Royal Essence: Al Asl Al Malaki Blended",
              desc: "Experience the legacy of ancient Moroccan perfumery through our flagship creation, a harmonious fusion of pure honey and royal white amber.",
              image: "/images/asal_elmalaki.png",
              tag: "INNOVATION"
            }
          ].map((item, idx) => (
            <div key={idx} className="group cursor-pointer animate-fade-in-up">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl mb-6 relative card-luxury bg-white dark:bg-card">
                 <img src={item.image} alt={item.title} className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute top-4 left-4 glass px-4 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#2D241E] dark:text-foreground">{item.tag}</div>
              </div>
              <h3 className="text-lg font-serif font-bold text-[#2D241E] dark:text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors mb-4 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">{item.desc}</p>
              <Link to="/products" className="inline-flex items-center gap-1 text-[10px] font-bold border-b border-[#2D241E] dark:border-foreground text-[#2D241E] dark:text-foreground tracking-widest uppercase group/link hover:border-gold-500 hover:text-gold-600 transition-all">
                READ MORE <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 9. INSTAGRAM FEED */}
      <section className="pb-24 pt-12">
        <div className="container mx-auto px-6 text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram className="h-5 w-5 text-gold-500" />
            <h2 className="text-xl font-serif font-bold text-[#2D241E] dark:text-foreground uppercase tracking-widest">Instagram Feed</h2>
          </div>
          <p className="text-xs text-muted-foreground">Follow us @OudRoyale_Luxury</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 border-t border-gold-500/10">
          {[
            "/images/layla lyaqout.png",
            "/images/andaluss.png",
            "/images/amir_alsahra.png",
            "/images/rouh lmaghrib.png",
            "/images/ibn_lmalik.png",
            "/images/al shamss.png"
          ].map((image, idx) => (
            <div key={idx} className="aspect-square overflow-hidden relative group bg-white dark:bg-card border border-gold-500/5">
              <img src={image} alt="Instagram Post" className="w-full h-full object-contain p-6 transition-all duration-700 group-hover:scale-125 group-hover:brightness-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/60 via-[#2D241E]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                <Instagram className="text-white h-8 w-8 animate-scale-in" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
