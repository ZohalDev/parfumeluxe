import { useState } from "react";
import { 
  ArrowRight, 
  Check, 
  Award, 
  ShoppingBag, 
  Users, 
  Star,
  Quote,
  Sparkles,
  TrendingUp,
  Target
} from "lucide-react";
import { Link } from "react-router";

export default function About() {
  const [activeTab, setActiveTab] = useState<"mission" | "vision" | "goal">("mission");

  const tabContents = {
    mission: {
      title: "Our Company Mission",
      desc1: "Our mission is to bring the art of high perfumery to those who appreciate olfactory perfection. By combining rare natural ingredients with contemporary blending techniques, we create scents that stand out.",
      desc2: "We aim to make luxury accessible yet exclusive, ensuring every spray delivers a statement of sophistication, heritage, and character.",
      icon: Sparkles
    },
    vision: {
      title: "Our Future Vision",
      desc1: "We envision Oud Royale as the premier destination for niche fragrance collectors worldwide, bridging the gap between historical oriental warmth and modern western freshness.",
      desc2: "Our pursuit of olfactory perfection guides our exploration of new note combinations, sustainable bottle packaging, and green extraction methodologies.",
      icon: TrendingUp
    },
    goal: {
      title: "Our Strategic Goal",
      desc1: "Our primary objective is to maintain an uncompromising standard of raw material selection. We partner directly with local farming communities in Taif, Grasse, and Southeast Asia to source pure oils.",
      desc2: "We strive to deliver exceptional value, outstanding customer support, and absolute customer confidence in our brand.",
      icon: Target
    }
  };

  const ActiveIcon = tabContents[activeTab].icon;

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-slate-900 transition-colors duration-300">
      {/* 1. HERO SECTION (Reference Pic 2 style) */}
      <div className="relative h-[70vh] min-h-[500px] w-full bg-[#EBE5DF] dark:bg-slate-900 flex items-center overflow-hidden transition-colors duration-300">
        
        {/* Background Image of the blonde lady - positioned to show fully */}
        <div className="absolute inset-0 flex justify-end z-0">
          <div className="relative w-full md:w-[70%] h-full">
            {/* Gradient mask to blend the left edge of the image smoothly into the background color */}
            <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#EBE5DF] to-transparent dark:from-slate-900 z-10 hidden md:block"></div>
            <img
              src="/images/ChatGPT Image 19 mai 2026, 17_27_06.png"
              alt="Elevate Your Style"
              className="h-full w-full object-cover object-[center_right] dark:opacity-80 transition-opacity"
            />
          </div>
        </div>

        {/* Mobile Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EBE5DF]/90 via-[#EBE5DF]/70 to-transparent dark:from-slate-900/95 dark:via-slate-900/70 dark:to-transparent z-10 md:hidden" />
        
        {/* Floating Breadcrumbs */}
        <div className="absolute top-6 left-6 md:left-12 z-20 flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium">
          <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition-colors">Oud Royale</Link>
          <span className="text-slate-300 dark:text-slate-700 font-normal">/</span>
          <span className="text-slate-800 dark:text-white">About Us</span>
        </div>

        {/* Content Container (Left-aligned) */}
        <div className="relative z-20 container mx-auto px-6 md:px-12 flex flex-col justify-center h-full max-w-xl md:max-w-2xl text-left">
          <h1 className="text-5xl md:text-6xl lg:text-[70px] font-serif text-[#2D241E] dark:text-white font-medium tracking-wide mb-4 leading-[1.1]">
            Elevate <br />
            Your Style!
          </h1>
          <p className="text-[16px] text-slate-600 dark:text-slate-300 font-normal tracking-wide mb-10">
            Feel the Fashion
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-row items-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3.5 rounded bg-[#A68A72] hover:bg-[#8B735F] text-white text-[13px] tracking-wider font-medium transition-colors shadow-sm"
            >
              Shop Now
            </Link>
            <Link
              to="/products"
              className="px-8 py-3.5 rounded border border-[#A68A72] hover:bg-[#A68A72]/10 text-[#2D241E] dark:text-white text-[13px] tracking-wider font-medium transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* 2. COMPANY ABOUT SECTION */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Composite Oval & Circular Images (Reference Pic 2 style) */}
          <div className="lg:col-span-6 relative w-full max-w-[440px] mx-auto h-[520px] flex items-center justify-center">
            {/* Background Watermark Text */}
            <span className="absolute -bottom-6 -right-10 text-[110px] font-serif italic text-slate-100 dark:text-slate-800/10 select-none pointer-events-none z-0">
              unleash
            </span>

            {/* Main Image: Vertical Capsule Oval */}
            <div className="w-[300px] h-[420px] rounded-full overflow-hidden border-[8px] border-white dark:border-slate-800 shadow-xl z-10 bg-slate-100 relative">
              <img 
                src="/images/tel7.png" 
                alt="Lifestyle luxury perfume" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlapping floating circular badge */}
            <div className="absolute top-12 right-4 w-[90px] h-[90px] rounded-full bg-white dark:bg-slate-800 flex flex-col justify-center items-center text-center shadow-md border-[0.5px] border-slate-100 dark:border-slate-700 z-20">
              <span className="text-[9px] uppercase tracking-wider font-medium text-slate-800 dark:text-slate-200">Our Unique</span>
              <span className="text-[7px] uppercase tracking-widest text-slate-400 mt-0.5">Product 100%</span>
              <span className="text-[12px] italic text-[#C5A059] font-serif mt-1">Organic</span>
            </div>

            {/* Front Image: Perfect Circle Overlap */}
            <div className="absolute -bottom-8 -right-5 w-[180px] h-[180px] rounded-full overflow-hidden border-[8px] border-white dark:border-slate-800 shadow-xl z-25 bg-slate-55">
              <img 
                src="/images/arouss_alfajr.png" 
                alt="Arouss Al Fajr luxury perfume" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Company details */}
          <div className="lg:col-span-6">
            <span className="text-[11px] uppercase tracking-widest text-[#C5A059] font-medium block mb-3">
              Company About
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2D241E] dark:text-white leading-tight font-medium mb-6">
              One of the finest ways to gain <br/>
              <span className="italic font-normal">olfactory perfection</span>
            </h2>
            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8">
              At Oud Royale, we design scents for those who seek to distinguish themselves. Sourcing precious raw ingredients globally and incorporating delicate extraction methods, our fragrances capture your essence and leave an unforgettable premium trail.
            </p>

            {/* Specialties Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0 text-[#3B6D11]">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-slate-800 dark:text-slate-200 font-medium">Rare Ingredients Sourced</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0 text-[#3B6D11]">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-slate-800 dark:text-slate-200 font-medium">French-Moroccan Fusion</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0 text-[#3B6D11]">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-slate-800 dark:text-slate-200 font-medium">24h+ Long-lasting Oils</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF3DE] flex items-center justify-center flex-shrink-0 text-[#3B6D11]">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-slate-800 dark:text-slate-200 font-medium">French Master Perfumers</span>
              </div>
            </div>

            {/* Explore Button */}
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#2D241E] hover:bg-[#1E1611] text-white font-medium text-xs uppercase tracking-wider transition-colors"
            >
              Explore Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. STATS BAR */}
      <section className="bg-[#2D241E] py-14">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full border-[0.5px] border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] flex-shrink-0 bg-white/5">
              <Award className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white font-medium">25+</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium mt-0.5">Years Of Heritage</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full border-[0.5px] border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] flex-shrink-0 bg-white/5">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white font-medium">12,000+</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium mt-0.5">Delivered Orders</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full border-[0.5px] border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] flex-shrink-0 bg-white/5">
              <Users className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white font-medium">15+</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium mt-0.5">Master Perfumers</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full border-[0.5px] border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] flex-shrink-0 bg-white/5">
              <Star className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-white font-medium">99%</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium mt-0.5">Five-Star Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION, VISION, GOAL TABS SECTION */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text and Tabs */}
          <div className="lg:col-span-6">
            <span className="text-[11px] uppercase tracking-widest text-[#C5A059] font-medium block mb-3">
              About Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2D241E] dark:text-white leading-tight font-medium mb-8">
              Our Main Goal to Satisfy <br />
              <span className="italic font-normal">Local & Global Clients</span>
            </h2>

            {/* Interactive Tabs */}
            <div className="flex border-b-[0.5px] border-slate-200 dark:border-slate-800 gap-4 mb-8">
              {(["mission", "vision", "goal"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs font-medium uppercase tracking-widest transition-all relative ${
                    activeTab === tab 
                      ? "text-[#C5A059]" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  Our {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5A059]" />
                  )}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            <div className="bg-[#FAF7F3] dark:bg-slate-800/40 p-6 rounded-xl border-[0.5px] border-[#C5A059]/10">
              <div className="flex items-center gap-3 mb-4 text-[#C5A059]">
                <ActiveIcon className="w-5 h-5" strokeWidth={1.5} />
                <h3 className="font-serif text-[18px] text-[#2D241E] dark:text-white font-medium">
                  {tabContents[activeTab].title}
                </h3>
              </div>
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                {tabContents[activeTab].desc1}
              </p>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {tabContents[activeTab].desc2}
              </p>
            </div>
          </div>

          {/* Right Column: Wide Image */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <img 
                src="/images/amir_alsahra.png"
                alt="Fragrance lab blending" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="bg-[#FAF7F3] dark:bg-slate-800/20 py-20 border-t-[0.5px] border-slate-100 dark:border-slate-800/60">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-widest text-[#C5A059] font-medium block mb-3">
              Our Experiences
            </span>
            <h2 className="text-3xl font-serif text-[#2D241E] dark:text-white font-medium">
              Trusted By Global Clients
            </h2>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border-[0.5px] border-slate-100 dark:border-slate-700/50 shadow-sm relative flex flex-col justify-between">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100 dark:text-slate-700" strokeWidth={1} />
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal italic mb-6">
                "Uclitries purus senectus facilisi montes nascetur gravida justo habitasse nullam, cursus malesuada posuere aliquam mustona sociosqu magnis condimentum neque."
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src="/images/hero_man.png" alt="Manaf Hasan" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-[#2D241E] dark:text-white">Manaf Hasan</h4>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">CFO / Founder</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex text-[#C5A059] gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border-[0.5px] border-slate-100 dark:border-slate-700/50 shadow-sm relative flex flex-col justify-between">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-100 dark:text-slate-700" strokeWidth={1} />
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal italic mb-6">
                "Purus Ultricies senectus facilisi montes nascetur gravida justo habitasse nullam, cursus malesuada posuere aliquam mustona sociosqu magnis condimentum neque."
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src="/images/hero_lifestyle.png" alt="Ayoub El Amrani" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-[#2D241E] dark:text-white">Ayoub El Amrani</h4>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Master Perfumer</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex text-[#C5A059] gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
