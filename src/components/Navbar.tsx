import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useWishlistStore } from "@/store/wishlistStore";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  Sun,
  Moon,
  Package,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { theme, toggle } = useThemeStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Products", to: "/products" },
    { label: "Blogs", to: "/blogs" },
    { label: "Careers", to: "/#careers" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "glass-nav shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]"
            : "bg-background/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        {/* Gold accent line at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-gold-500 opacity-0 group-hover:opacity-100 transition-all duration-500 absolute -left-6 top-1/2 -translate-y-1/2" />
                <span className="text-xl font-serif font-bold tracking-[0.08em] text-foreground transition-all duration-300 group-hover:text-gold-gradient">
                  OUD ROYALE
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-gold-400 after:to-gold-600 after:transition-all after:duration-400 hover:after:w-full after:rounded-full"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {/* Theme */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px] transition-transform duration-500 hover:rotate-45" />
                ) : (
                  <Moon className="h-[18px] w-[18px] transition-transform duration-500 hover:-rotate-12" />
                )}
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
              >
                <Link to="/wishlist">
                  <Heart className="h-[18px] w-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-[9px] font-bold text-white shadow-gold-sm animate-scale-in">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
              >
                <Link to="/cart">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background shadow-sm animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full ring-2 ring-gold-500/30 hover:ring-gold-500/60 transition-all duration-300"
                        />
                      ) : (
                        <User className="h-[18px] w-[18px]" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 glass rounded-xl border-gold-500/10">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-medium truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <UserCircle className="h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 rounded-full"
                >
                  <Link to="/login">
                    <User className="h-[18px] w-[18px]" />
                  </Link>
                </Button>
              )}

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-gold-500/10 rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div
          className={`overflow-hidden transition-all duration-400 ${
            searchOpen ? "max-h-20 opacity-100 border-t border-gold-500/10" : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <div className="mx-auto max-w-2xl px-4 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for fragrances, brands, notes..."
                className="w-full rounded-full border border-gold-500/20 bg-muted/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ${
            mobileMenuOpen ? "max-h-96 border-t border-gold-500/10" : "max-h-0"
          }`}
        >
          <div className="px-4 py-4 space-y-1 bg-background/95 backdrop-blur-xl">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent my-2" />
                <Link
                  to="/profile"
                  className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
