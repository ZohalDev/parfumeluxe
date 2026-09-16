# 🧴 Parfumeluxe — Project Implementation Plan

> Stack: **React 19 + Vite** · **Hono + tRPC** · **Drizzle ORM + MySQL** · **Zustand** · **Tailwind CSS + shadcn/ui**

---

## ✅ Phase 1 — Core E-Commerce (COMPLETE)

| Feature | File(s) | Status |
|---|---|---|
| Home page (hero, categories, featured products) | `src/pages/Home.tsx` | ✅ Done |
| Product listing + filters (category, price, search) | `src/pages/Products.tsx` | ✅ Done |
| Product detail page (images, reviews, related) | `src/pages/ProductDetail.tsx` | ✅ Done |
| Persistent cart (Zustand + localStorage) | `src/store/cartStore.ts` | ✅ Done |
| Cart page (qty update, remove, total) | `src/pages/Cart.tsx` | ✅ Done |
| Checkout (shipping form, COD/Card, coupon, order) | `src/pages/Checkout.tsx` | ✅ Done |
| Wishlist (toggle, add to cart, remove) | `src/pages/Wishlist.tsx` + `wishlistStore.ts` | ✅ Done |
| Order history page | `src/pages/Orders.tsx` | ✅ Done |
| Auth (Kimi OAuth, session cookie, JWT) | `api/auth-router.ts` + `api/kimi/` | ✅ Done |
| Review system (submit, star rating, list) | `api/review-router.ts` | ✅ Done |
| Coupon validation | `api/coupon-router.ts` | ✅ Done |
| Admin dashboard (products, orders, users, analytics) | `src/pages/Dashboard/` | ✅ Done (skeleton) |
| Dark mode toggle | `src/store/themeStore.ts` | ✅ Done |
| DB schema (users, products, orders, reviews, coupons) | `db/schema.ts` | ✅ Done |

---

## 🚧 Phase 2 — User Experience Improvements (NEXT UP)

### 2.1 — User Profile Page 🔴 High Priority
- **What**: A `/profile` page so users can see their account info and update their display name/avatar.
- **Files to create**: `src/pages/Profile.tsx`
- **Files to update**: `src/App.tsx` (add route), `api/auth-router.ts` (add `updateMe` mutation)
- **Effort**: Medium

### 2.2 — Global Search Bar 🔴 High Priority
- **What**: Search input in the `Navbar` that navigates to `/products?search=...`. The backend `listProducts` query already accepts a `search` param — just needs the UI.
- **Files to update**: `src/components/Navbar.tsx`
- **Effort**: Low

### 2.3 — Product Image Gallery 🟡 Medium Priority
- **What**: The DB schema has an `images` text field (JSON array) but `ProductDetail.tsx` only shows one image. Add a thumbnail gallery strip below the main image.
- **Files to update**: `src/pages/ProductDetail.tsx`
- **Effort**: Low

### 2.4 — Register / Email+Password Auth 🟡 Medium Priority
- **What**: Currently the only login is "Sign in with Kimi" OAuth. Adding email/password login would unlock a broader user base.
- **Files to create**: Updates to `api/auth-router.ts`, `src/pages/Login.tsx`
- **Effort**: High

### 2.5 — Order Detail Page 🟡 Medium Priority
- **What**: Clicking an order in `/orders` shows a dedicated order detail page with full shipping info and a timeline of status changes.
- **Files to create**: `src/pages/OrderDetail.tsx`
- **Files to update**: `src/App.tsx`, `src/pages/Orders.tsx`
- **Effort**: Medium

### 2.6 — Wishlist → Cart Bulk Action 🟢 Low Priority
- **What**: "Add all to cart" button on the Wishlist page.
- **Files to update**: `src/pages/Wishlist.tsx`
- **Effort**: Low

---

## 🛠 Phase 3 — Admin & Backend (UPCOMING)

### 3.1 — Admin Analytics with Real Data 🔴 High Priority
- **What**: The `Analytics.tsx` dashboard page currently has no live charts. Connect it to real revenue, order count, and top products data from the API.
- **Files to update**: `src/pages/Dashboard/Analytics.tsx`, `api/admin-router.ts`
- **Effort**: Medium

### 3.2 — Order Status Management 🔴 High Priority
- **What**: Admin can update order status (Pending → Processing → Shipped → Delivered) from the `OrdersManager`. The DB enum is already defined.
- **Files to update**: `src/pages/Dashboard/OrdersManager.tsx`, `api/order-router.ts`
- **Effort**: Medium

### 3.3 — Product Image Upload (S3) 🟡 Medium Priority
- **What**: The project already has `@aws-sdk/client-s3` installed. Wire up an image upload endpoint in the admin `ProductsManager`.
- **Files to update**: `api/admin-router.ts`, `src/pages/Dashboard/ProductsManager.tsx`
- **Effort**: High

### 3.4 — Coupon Management UI 🟡 Medium Priority
- **What**: Allow admins to create, enable/disable, and delete coupons from the dashboard. The backend `couponRouter` exists but the admin UI panel is missing.
- **Files to create**: `src/pages/Dashboard/CouponsManager.tsx`
- **Files to update**: `src/pages/Dashboard/AdminDashboard.tsx`, `src/App.tsx`
- **Effort**: Medium

### 3.5 — Email Notifications 🟢 Low Priority
- **What**: Send order confirmation emails using Resend or SendGrid after a successful order.
- **Files to update**: `api/order-router.ts`
- **Effort**: Medium

### 3.6 — Stripe Payment Gateway 🟢 Low Priority
- **What**: Replace the "Credit Card" placeholder with actual Stripe checkout flow.
- **Files to update**: `src/pages/Checkout.tsx`, `api/order-router.ts`
- **Effort**: High

---

## 💎 Phase 4 — Polish & Performance

### 4.1 — Micro-animations 🟡 Medium Priority
- **What**: Add `framer-motion` or CSS transition animations to page transitions, cart drawer open/close, and button interactions.
- **Effort**: Medium

### 4.2 — SEO Meta Tags 🟡 Medium Priority
- **What**: Dynamic `<title>` and `<meta description>` per page using `react-helmet-async`.
- **Files to update**: Every page component
- **Effort**: Low

### 4.3 — Pagination on Products Page 🟡 Medium Priority
- **What**: The `listProducts` API already supports `limit`/`offset`. Add pagination controls to `Products.tsx`.
- **Files to update**: `src/pages/Products.tsx`, `api/product-router.ts`
- **Effort**: Low

### 4.4 — Skeleton Loading States 🟢 Low Priority
- **What**: Replace raw pulse divs with proper shadcn `<Skeleton>` components across all pages.
- **Effort**: Low

---

## 🎯 Immediate Next 3 Tasks (Recommended Order)

1. **Search Bar in Navbar** — Quick win, the API already supports it.
2. **User Profile Page** — Core UX gap, users can't view/edit their info.
3. **Admin Analytics with Real Data** — Dashboard is there but empty.

---

> Last updated: **2026-05-13**
