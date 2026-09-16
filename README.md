# Oud Royale

Production-focused luxury perfume e-commerce app built with React, Vite, Hono, tRPC, Drizzle ORM, and MySQL.

## Current Phase (Phase 1) Highlights

- Hardened auth and session flow:
  - OAuth state CSRF protection with one-time cookie-bound state.
  - Stronger JWT verification (issuer, audience, subject, expiration via jose validation).
  - Session lifetime reduced from 1 year to 7 days.
  - Practical token revocation strategy using `users.sessionVersion` bump on logout.
- Added request throttling:
  - OAuth callback endpoint.
  - `order.create` mutation.
- Correctness fixes:
  - `maxPrice` now applies in product filtering.
  - Cart update/remove now correctly target `productId` for parity with frontend usage.
  - Cart links now consistently prefer product slugs.
  - Order creation now runs in a DB transaction with stock checks and race-safe decrements.
  - Structured API errors via `TRPCError` for common router failure paths.
- Admin listing pagination:
  - Server-side pagination for users, products, and admin orders.
  - Dashboard pages updated with paged queries and simple previous/next controls.
- Branding groundwork:
  - Key brand strings renamed to **Oud Royale**.
  - Centralized design tokens introduced in `src/index.css`.

## Tech Stack

- Frontend: React 19, React Router, Tailwind, Zustand, React Query, tRPC client
- Backend: Hono, tRPC server, Drizzle ORM, MySQL
- Tooling: TypeScript, ESLint, Vitest, Vite

## Getting Started

1. Install dependencies:
   - `npm install`
2. Configure environment:
   - Copy `.env.example` to `.env`
   - Fill required values (`APP_ID`, `APP_SECRET`, `DATABASE_URL`, `KIMI_AUTH_URL`, `KIMI_OPEN_URL`)
3. Run database setup:
   - `npm run db:push`
4. Start development server:
   - `npm run dev`

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build frontend and backend bundle
- `npm run start` - Run production bundle
- `npm run check` - TypeScript project checks
- `npm run lint` - Lint source files
- `npm run test` - Run Vitest suite
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes to DB

## Notes for Next Phase

- UI luxury redesign and deeper brand expression
- Expanded commerce features (payments/shipping integrations, inventory operations, richer promotions)
- Expanded integration tests around checkout pipeline with seeded DB fixtures
