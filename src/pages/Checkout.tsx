import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle,
  ShieldCheck,
  Lock,
  Package,
  MapPin,
  Phone,
  User as UserIcon,
  Mail,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/providers/trpc";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import type { OrderConfirmationData } from "@/components/OrderConfirmationModal";

// Initialize Stripe outside of component render
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_dummy"
);

type PaymentMethod = "card" | "cod";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

// Subcomponent to handle the actual Stripe payment submission
function StripePaymentForm({
  onSuccess,
  total,
}: {
  onSuccess: () => void;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-sm font-semibold mt-4"
        size="lg"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Pay {total.toFixed(0)} MAD
          </span>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, getTotal, clearCart } = useCartStore();

  const [completedOrder, setCompletedOrder] = useState<OrderConfirmationData | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Morocco",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({});
  
  const utils = trpc.useUtils();
  const syncCart = trpc.cart.sync.useMutation();

  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      syncCart.mutate(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
    }
  }, [items, isAuthenticated]);

  const { data: paymentIntentData, refetch: refetchPaymentIntent } = trpc.order.createPaymentIntent.useQuery(
    { couponCode: appliedCoupon?.code },
    { enabled: isAuthenticated && items.length > 0 && paymentMethod === "card", refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (paymentMethod === "card") {
      refetchPaymentIntent();
    }
  }, [appliedCoupon, paymentMethod, refetchPaymentIntent]);

  const subtotal = getTotal();
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? subtotal * (appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;
  const shippingCost = subtotal >= 1500 ? 0 : 150;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setCompletedOrder({
        orderId: data.orderId,
        customerName: `${shipping.firstName} ${shipping.lastName}`,
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          volume: "100ml",
        })),
        subtotal,
        shipping: shippingCost,
        total,
        address: {
          street: shipping.address,
          city: shipping.city,
          country: shipping.country,
        }
      });
      clearCart();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to place order");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Lock className="mx-auto h-14 w-14 text-slate-300 dark:text-slate-600" />
        <h2 className="mt-4 text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Sign in to continue
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          You need to be signed in to complete your purchase
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Package className="mx-auto h-14 w-14 text-slate-300 dark:text-slate-600" />
        <h2 className="mt-4 text-2xl font-serif font-bold text-slate-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Add some products before checking out
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingInfo, string>> = {};
    if (!shipping.firstName.trim()) newErrors.firstName = "First name is required";
    if (!shipping.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!shipping.email.trim()) newErrors.email = "Email is required";
    if (!shipping.phone.trim()) newErrors.phone = "Phone is required";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await utils.coupon.validate.fetch(couponCode.trim().toUpperCase());
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        toast.success(`Coupon "${result.coupon.code}" applied!`);
      } else {
        toast.error(result.message || "Invalid coupon");
      }
    } catch {
      toast.error("Could not validate coupon");
    }
  };

  const handlePlaceOrder = () => {
    if (!validate()) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    const fullAddress = `${shipping.firstName} ${shipping.lastName}\n${shipping.address}\n${shipping.city}, ${shipping.zipCode}\n${shipping.country}\nPhone: ${shipping.phone}`;
    
    // For COD, we place the order immediately
    if (paymentMethod === "cod") {
      createOrder.mutate({
        shippingAddress: fullAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });
    }
  };

  const handleStripeSuccess = () => {
    const fullAddress = `${shipping.firstName} ${shipping.lastName}\n${shipping.address}\n${shipping.city}, ${shipping.zipCode}\n${shipping.country}\nPhone: ${shipping.phone}`;
    createOrder.mutate({
      shippingAddress: fullAddress,
      paymentMethod: "card",
      couponCode: appliedCoupon?.code,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <h1 className="mt-4 text-3xl font-serif font-bold text-slate-900 dark:text-white">
            Checkout
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Complete your order in just a few steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column — Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Information */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Shipping Information
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> First Name
                  </Label>
                  <Input
                    placeholder="John"
                    value={shipping.firstName}
                    onChange={(e) => updateShipping("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> Last Name
                  </Label>
                  <Input
                    placeholder="Doe"
                    value={shipping.lastName}
                    onChange={(e) => updateShipping("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={shipping.email}
                    onChange={(e) => updateShipping("email", e.target.value)}
                    className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+212 6XX-XXXXXX"
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                    className={errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Address — full width */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Street Address
                  </Label>
                  <Input
                    placeholder="123 Boulevard Mohammed V, Apt 4B"
                    value={shipping.address}
                    onChange={(e) => updateShipping("address", e.target.value)}
                    className={errors.address ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> City
                  </Label>
                  <Input
                    placeholder="Casablanca"
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    className={errors.city ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* Zip Code */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" /> Zip Code
                  </Label>
                  <Input
                    placeholder="20000"
                    value={shipping.zipCode}
                    onChange={(e) => updateShipping("zipCode", e.target.value)}
                    className={errors.zipCode ? "border-red-400 focus-visible:ring-red-400" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-xs text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Payment Method
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "card"
                      ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/50"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {paymentMethod === "card" && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="h-5 w-5 text-slate-900 dark:text-white" />
                    </div>
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      Credit / Debit Card
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Visa, Mastercard, or other cards
                    </p>
                  </div>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    paymentMethod === "cod"
                      ? "border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800/50"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  {paymentMethod === "cod" && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle className="h-5 w-5 text-slate-900 dark:text-white" />
                    </div>
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      Cash on Delivery
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Pay when you receive your order
                    </p>
                  </div>
                </button>
              </div>

              {/* Payment Processing Area */}
              <div className="mt-6">
                {paymentMethod === "cod" ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
                      <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Please have the exact amount ready. Our delivery partner will collect{" "}
                        <strong>{total.toFixed(0)} MAD</strong> upon delivery.
                      </p>
                    </div>
                    <Button
                      className="w-full h-12 text-sm font-semibold"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Place Order — {total.toFixed(0)} MAD
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {paymentIntentData?.clientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret: paymentIntentData.clientSecret,
                          appearance: { theme: 'stripe' },
                        }}
                      >
                        <StripePaymentForm 
                          onSuccess={handleStripeSuccess}
                          total={total}
                        />
                      </Elements>
                    ) : (
                      <div className="flex items-center justify-center p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Loading secure payment gateway...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Order Summary
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} {items.length === 1 ? "item" : "items"} in your cart
                </p>

                {/* Items */}
                <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border dark:border-slate-700">
                        <img
                          src={item.image || "/images/perfume1.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.price.toFixed(0)} MAD × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {(item.price * item.quantity).toFixed(0)} MAD
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Coupon */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="uppercase text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                    className="shrink-0"
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Coupon "{appliedCoupon.code}" applied
                  </div>
                )}

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                    <span className="text-slate-900 dark:text-white">
                      {subtotal.toFixed(0)} MAD
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">
                        -{discount.toFixed(0)} MAD
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                    <span className="text-slate-900 dark:text-white">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Free</span>
                      ) : (
                        `${shippingCost.toFixed(0)} MAD`
                      )}
                    </span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {total.toFixed(0)} MAD
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 py-2.5 dark:bg-slate-800/50">
                    <ShieldCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Secure
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 py-2.5 dark:bg-slate-800/50">
                    <Truck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Fast Delivery
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-slate-50 py-2.5 dark:bg-slate-800/50">
                    <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      Authentic
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderConfirmationModal order={completedOrder} onClose={() => navigate("/products")} />
    </div>
  );
}
