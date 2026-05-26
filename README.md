# Allo Inventory

An inventory and order-fulfillment platform with race-condition-free reservation logic built with Next.js App Router, Prisma, and Neon Postgres.

## Live URL

[Add your Vercel URL here after deployment]

## How to Run Locally

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) Postgres database

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/kumarideepali0402/Inventory
   cd allo-inventory
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root with your Neon connection string
   ```
   DATABASE_URL="postgresql://your-neon-connection-string"
   ```

4. Run migrations
   ```bash
   npx prisma migrate dev
   ```

5. Seed the database
   ```bash
   npx prisma db seed
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`

## How Expiry Works in Production

Reservations expire after 10 minutes. The expiry mechanism uses **lazy cleanup**:

When `GET /api/products` is called, the server first checks for any `PENDING` reservations where `expiresAt < now`. These are set to `RELEASED` and `reservedUnits` is decremented on the corresponding Stock row — making those units available again for other customers.

This means units are freed up the next time the product listing is fetched, not at the exact moment of expiry.

**Trade-off:** In low-traffic periods, expired units could remain reserved for longer than necessary. In production I would add a Vercel Cron job running every minute to proactively release expired reservations regardless of traffic.

## How Concurrency is Handled

The reservation endpoint uses an **atomic SQL UPDATE** to prevent race conditions:

```sql
UPDATE "Stock"
SET "reservedUnits" = "reservedUnits" + quantity
WHERE "productId" = X AND "warehouseId" = Y
AND ("totalUnits" - "reservedUnits") >= quantity
RETURNING *
```

The availability check and the increment happen as a single atomic operation in Postgres. Two simultaneous requests for the last unit cannot both succeed — Postgres serializes the updates at the row level. If the UPDATE returns 0 rows, there was not enough stock and the request gets a 409.

I initially planned to use `SELECT FOR UPDATE` inside a Prisma transaction, but Prisma 7's driver adapter does not support interactive transactions (throws `P2028`). The atomic UPDATE is an equivalent and arguably cleaner solution — one database round trip instead of three.

## Trade-offs and What I'd Do Differently

- **Expiry:** Used lazy cleanup instead of a background worker to keep deployment simple. Would add a Vercel Cron job in production.
- **Idempotency:** Skipped the bonus due to time constraints. Would implement using Redis (Upstash) — store `Idempotency-Key → response` with a 24hr TTL to handle client retries safely.
- **Authentication:** No auth in this implementation. Would add in production.
- **Testing:** Manually verified concurrency with simultaneous curl requests. Would add automated integration tests hitting a real test database to catch regressions.
- **Prisma 7:** First time using Prisma 7 — the driver adapter pattern and new config file (`prisma.config.ts`) were different from older versions. Adapted by using `@prisma/adapter-pg` and moving seed config to `prisma.config.ts`.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | Neon (hosted Postgres) |
| Styling | Tailwind CSS |
| Deploy | Vercel |
