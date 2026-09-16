import { Link } from "react-router";
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gold-500/10 bg-card overflow-hidden">
      {/* Subtle noise texture */}
      <div className="noise absolute inset-0" />

      {/* Gold gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Top section – Newsletter CTA */}
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-gold-500 animate-float" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold-600 dark:text-gold-400">
              Stay Connected
            </span>
            <Sparkles className="h-4 w-4 text-gold-500 animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Subscribe to Our Maison
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Be the first to discover new fragrances, exclusive offers, and the art of luxury perfumery.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="flex w-full max-w-md gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-full border border-gold-500/20 bg-background/50 px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/40 transition-all"
            />
            <button
              type="submit"
              className="group rounded-full bg-foreground hover:bg-foreground/90 text-background px-6 py-3 text-sm font-medium transition-all duration-300 hover:shadow-gold-sm flex items-center gap-2"
            >
              Join
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="luxury-divider mb-14">
          <span className="text-gold-500 text-sm">✦</span>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <h3 className="text-xl font-serif font-bold tracking-[0.06em] text-gold-gradient">
              OUD ROYALE
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover the art of fine fragrance. Curated luxury perfumes
              from the world's most prestigious Moroccan ateliers.
            </p>
            <div className="flex gap-3 pt-1">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/20 text-muted-foreground transition-all duration-300 hover:border-gold-500/60 hover:text-gold-600 dark:hover:text-gold-400 hover:shadow-gold-sm hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-6">
              Shop
            </h4>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              {[
                { to: "/products", label: "All Products" },
                { to: "/products?featured=true", label: "Featured" },
                { to: "/products?category=floral", label: "Floral" },
                { to: "/products?category=oriental", label: "Oriental" },
                { to: "/products?category=woody", label: "Woody" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group/link inline-flex items-center gap-1 hover:text-foreground transition-all duration-300"
                  >
                    <span className="w-0 group-hover/link:w-3 transition-all duration-300 overflow-hidden">
                      <ArrowRight className="h-3 w-3 text-gold-500" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-6">
              Support
            </h4>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              {[
                { to: "/legal/shipping", label: "Shipping & Delivery" },
                { to: "/legal/returns", label: "Returns & Exchanges" },
                { to: "/legal/faq", label: "FAQ" },
                { to: "/legal/privacy", label: "Privacy Policy" },
                { to: "/legal/terms", label: "Terms of Service" },
                { to: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group/link inline-flex items-center gap-1 hover:text-foreground transition-all duration-300"
                  >
                    <span className="w-0 group-hover/link:w-3 transition-all duration-300 overflow-hidden">
                      <ArrowRight className="h-3 w-3 text-gold-500" />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground mb-6">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/10">
                  <MapPin className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
                </div>
                <span className="pt-1">123 Rue de la Parfumerie, Paris, France</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/10">
                  <Phone className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
                </div>
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/10">
                  <Mail className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" />
                </div>
                hello@oudroyale.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-gold-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {currentYear} Oud Royale. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors duration-300">
              Privacy
            </Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors duration-300">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
