import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  Package,
  Heart,
  Settings,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";
import { orderStatusConfig } from "@/lib/orderStatus";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const utils = trpc.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const { data: orders } = trpc.order.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateMutation = trpc.auth.updateMe.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <UserIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-3 text-muted-foreground">
          Access your profile, orders, and wishlist
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const totalSpent =
    orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {/* Profile Header */}
      <div className="mt-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || ""}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-background shadow-luxury"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-luxury">
              <span className="text-3xl font-serif font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          {user?.role === "admin" && (
            <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold-500 text-white border-0">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.name || "Welcome"}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground justify-center sm:justify-start">
            <Calendar className="h-3.5 w-3.5" />
            Member since {memberSince}
          </div>
        </div>

        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setName(user?.name || "");
              setEmail(user?.email || "");
              setIsEditing(true);
            }
          }}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isEditing ? (
            <Save className="h-4 w-4 mr-2" />
          ) : (
            <Settings className="h-4 w-4 mr-2" />
          )}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-luxury">
          <Package className="mx-auto h-5 w-5 text-gold-500" />
          <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
          <p className="text-xs text-muted-foreground">Orders</p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-luxury">
          <Heart className="mx-auto h-5 w-5 text-red-500" />
          <p className="mt-2 text-2xl font-bold">{wishlistCount}</p>
          <p className="text-xs text-muted-foreground">Wishlist</p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-luxury">
          <span className="mx-auto block text-gold-500 font-bold text-sm">$</span>
          <p className="mt-2 text-2xl font-bold">{totalSpent.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Edit Form */}
      {isEditing && (
        <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" /> Display Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders" className="text-sm">
              View All →
            </Link>
          </Button>
        </div>

        {totalOrders === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">
              You haven't placed any orders yet
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders?.slice(0, 5).map((order) => {
              const status =
                orderStatusConfig[order.status] || orderStatusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div
                  key={order.id}
                  className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-luxury"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      <Badge className={status.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {order.items.slice(0, 4).map((item) => (
                        <img
                          key={item.id}
                          src={item.productImage || "/images/perfume1.jpg"}
                          alt={item.productName}
                          className="h-10 w-10 rounded-lg object-cover border"
                        />
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
