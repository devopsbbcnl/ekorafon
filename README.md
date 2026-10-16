# Ekorafon

A B2B sourcing marketplace connecting buyers with verified manufacturers in Nigeria and West Africa. Buyers browse factories and products, post RFQs (requests for quotation), and pay through escrow. Suppliers get verified, list products, and quote on RFQs. Trust is scored with ETRS (Ekorafon Trust & Reputation Score).

## Repository layout

Turborepo monorepo (npm workspaces).

| Path | Description | Stack |
| --- | --- | --- |
| `apps/web` | Public site and buyer/supplier dashboards (port 3000) | Next.js 16, React 19, Tailwind 4 |
| `apps/admin` | Internal admin dashboard (port 3001) | Next.js 16, React 19 |
| `apps/api` | REST API under `/api` (port 4000) | Express 4, Prisma 5, PostgreSQL, Zod |
| `packages/shared` | Shared types and Zod schemas | TypeScript |
| `docs/legal` | Founder and co-founder legal documents | Markdown |

## Features

**Buyers:** factory directory and manufacturer category pages, product catalogue, RFQ posting and awarding, orders, Paystack escrow payments, supplier reviews.

**Suppliers:** factory profile, verification requests, product and stock management (verified factories only), quoting on RFQs, incoming order handling.

**Admin:** overview stats and analytics, user management with per-permission roles, factory verification, order status, product moderation, review moderation, escrow release and refund.

**Platform:** email verification and password reset (Resend), JWT auth, role-based access (`BUYER`, `SUPPLIER`, `ADMIN`), sitemap and robots.

## Getting started

Requires Node 20+ and PostgreSQL.

```bash
npm install

# API
cp apps/api/.env.example apps/api/.env          # set DATABASE_URL, JWT_SECRET, PAYSTACK_SECRET_KEY
cp apps/web/.env.local.example apps/web/.env.local
cp apps/admin/.env.local.example apps/admin/.env.local
npm run db:generate
npm run db:migrate
npm run seed --workspace @ekorafon/api          # optional: sample factories and RFQs

npm run dev                                     # starts web, admin, and api via turbo
```

Create the first admin account with `ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npx tsx create-admin.ts` (run from `apps/api`; password at least 12 characters).

Without `RESEND_API_KEY`, emails are logged to the console instead of sent.

## Environment variables

| App | Variable | Purpose |
| --- | --- | --- |
| api | `DATABASE_URL` | PostgreSQL connection string |
| api | `JWT_SECRET` | Token signing secret |
| api | `PAYSTACK_SECRET_KEY` | Payments and webhook signature check |
| api | `WEB_URL`, `ADMIN_URL` | Allowed CORS origins in production |
| api | `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email |
| web, admin | `NEXT_PUBLIC_API_URL` | API base URL, e.g. `http://localhost:4000/api` |
| web | `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |

In development the API only allows origins `localhost:3000` and `localhost:3001`.

## Deployment

- **web, admin:** Netlify (`netlify.toml` in each app).
- **api:** Railway (`apps/api/railway.toml`). Runs `prisma migrate deploy` on start; health check at `/api/health`.
- Register `https://<api-host>/api/payment/webhook` as the Paystack webhook URL.

## Status

Core marketplace flows are implemented end to end: auth, factories, RFQs and quotes, products, orders, payments, reviews, verification, and admin. See open items for known gaps.

### Open items

- Escrow release and refund only update database state; they do not move money through Paystack.
- No automated tests or CI.
- File uploads (`multer` is installed) are not wired to any route; verification documents and photos are stored as plain string lists.
- Privacy and Terms pages need legal review before launch.
