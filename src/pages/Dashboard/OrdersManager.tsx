import { useState } from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  processing: { label: "Processing", icon: Package, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const allStatuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;
const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrdersManager() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.order.adminList.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter as (typeof allStatuses)[number],
  });

  const updateStatusMutation = trpc.order.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as (typeof orderStatuses)[number],
    });
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Manage and track all customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {allStatuses.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all capitalize ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "all" ? "All Orders" : status}
            </button>
          );
        })}
        <span className="text-xs text-muted-foreground ml-auto">
          {data?.total ?? 0} orders
        </span>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-luxury"
              >
                {/* Header Row */}
                <button
                  className="w-full flex flex-wrap items-center gap-4 p-4 text-left"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0">
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">Order #{order.id}</p>
                      <Badge className={`${status.color} border-0 text-[10px]`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.user?.name || "Unknown"} · {order.user?.email || ""} ·{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">
                      ${Number(order.total).toFixed(2)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-4 space-y-4 animate-slide-up">
                    {/* Items */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Items
                      </p>
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.productImage || "/images/perfume1.jpg"}
                            alt={item.productName}
                            className="h-10 w-10 rounded-lg object-cover border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${Number(item.price).toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.shippingAddress && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Shipping Address
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {order.shippingAddress}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Payment
                        </p>
                        <p className="text-sm capitalize">{order.paymentMethod || "—"}</p>
                        {order.couponCode && (
                          <p className="text-xs text-gold-600 dark:text-gold-400 mt-0.5">
                            Coupon: {order.couponCode} (-${Number(order.discount).toFixed(2)})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Update Status:
                      </p>
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updateStatusMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
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
