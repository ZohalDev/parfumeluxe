import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";

export const orderStatusConfig: Record<
  string,
  { icon: typeof Package; color: string; label: string }
> = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  processing: { icon: Package, color: "bg-blue-100 text-blue-800", label: "Processing" },
  shipped: { icon: Truck, color: "bg-purple-100 text-purple-800", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Cancelled" },
};
