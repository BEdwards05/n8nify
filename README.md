# n8nify.io

Marketplace for downloadable n8n workflow templates.

## Stack

- Next.js 16 (App Router)
- PostgreSQL + Drizzle ORM
- Better Auth
- Stripe Connect
- MinIO (S3-compatible storage)
- Redis + BullMQ worker
- Docker Compose + Caddy

## Local development

```bash
# Start infrastructure
docker compose up -d postgres redis minio minio-init

# Push schema and seed
npm run db:push
npm run db:seed

# Run app (defaults to http://localhost:3001 — port 3000 is often taken)
npm run dev
```

Open **http://localhost:3001** (not 3000 if another app is running there).

Default admin: `admin@n8nify.io` / `changeme123`

## Production (self-hosted)

1. Copy `.env.example` to `.env` and fill in secrets
2. Point `n8nify.io` DNS to your VPS
3. `docker compose up -d`
4. `docker compose exec app npm run db:push`
5. `docker compose exec app npm run db:seed`
6. Configure Stripe webhook: `https://n8nify.io/api/webhooks/stripe`

## Scripts

- `npm run db:push` — apply schema
- `npm run db:seed` — seed categories and admin user
- `npm run worker` — background job processor
- `./scripts/backup.sh` — backup Postgres and MinIO
