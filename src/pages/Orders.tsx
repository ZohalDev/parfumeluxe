import { Link } from "react-router";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; step: number }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", step: 1 },
  processing: { label: "Processing", icon: Package, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", step: 2 },
  shipped: { label: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", step: 3 },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", step: 4 },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", step: 0 },
};

const timelineSteps = ["pending", "processing", "shipped", "delivered"];

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.order.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Package className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-3xl font-bold">Sign in to view orders</h2>
        <p className="mt-2 text-muted-foreground">Track your purchases and order history</p>
        <Button asChild className="mt-8 rounded-full px-8" size="lg">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <div className="mt-6">
        <p className="text-[10px] font-medium tracking-[0.3em] text-gold-600 dark:text-gold-400 uppercase">
          Order History
        </p>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center py-16">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">Start shopping to see your orders here</p>
          <Button asChild className="mt-8 rounded-full px-8" size="lg">
            <Link to="/products">Explore Fragrances</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders?.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;
            const currentStep = status.step;

            return (
              <div
                key={order.id}
                className="rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-luxury"
              >
                {/* Header */}
                <button
                  className="w-full flex flex-wrap items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold">{Number(order.total).toFixed(0)} MAD</span>
                    <Badge className={`${status.color} border-0`}>
                      {status.label}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4 space-y-5 animate-slide-up">
                    {/* Timeline */}
                    {order.status !== "cancelled" && (
                      <div className="flex items-center gap-1">
                        {timelineSteps.map((step, i) => {
                          const stepStatus = statusConfig[step];
                          const isActive = stepStatus.step <= currentStep;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div
                                  className={`h-3 w-3 rounded-full transition-colors ${
                                    isActive
                                      ? "bg-gold-500"
                                      : "bg-border"
                                  }`}
                                />
                                <span className="mt-1.5 text-[9px] font-medium text-muted-foreground">
                                  {stepStatus.label}
                                </span>
                              </div>
                              {i < timelineSteps.length - 1 && (
                                <div
                                  className={`h-0.5 flex-1 -mt-4 ${
                                    statusConfig[timelineSteps[i + 1]].step <= currentStep
                                      ? "bg-gold-500"
                                      : "bg-border"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img
                            src={item.productImage || "/images/perfume1.jpg"}
                            alt={item.productName}
                            className="h-14 w-14 rounded-lg object-cover border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(item.price).toFixed(0)} MAD × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {(Number(item.price) * item.quantity).toFixed(0)} MAD
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-3 flex items-center justify-between">
                      <div className="text-sm space-y-0.5">
                        {Number(order.discount) > 0 && (
                          <p className="text-green-600 dark:text-green-400">
                            Discount: -{Number(order.discount).toFixed(0)} MAD
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold">
                        Total: {Number(order.total).toFixed(0)} MAD
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
