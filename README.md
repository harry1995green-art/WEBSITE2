# Artisanic CRM

A CRM for **Artisanic Roofing** and **Ballers Abroad**, plus a roof survey tool
with photo uploads and scoring. Built with Next.js (App Router), Prisma, and
Postgres.

Both businesses share one app — switch between them with the **AR / BA**
toggle at the top of every page. All data (leads, jobs, contacts, tasks,
finance, calendar, wages, staff, surveys) is kept fully separate per
organization.

> **No login.** There is currently no authentication — anyone with the URL
> has full read/write access. This was a deliberate choice to unblock access
> quickly; if you want a login back, a previous version of this app had one
> (cookie session + a seeded admin user) — ask for it to be reinstated, or
> put the deployment behind your host's own access control (e.g. Vercel's
> Deployment Protection) in the meantime.

## Getting started

You need a Postgres database for local development too (the schema targets
Postgres so it matches production) — either run one locally/in Docker, or
use a free instance from [Neon](https://neon.tech) or
[Supabase](https://supabase.com).

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL + CRM_API_KEY
npm run db:migrate     # applies the schema to your Postgres database
npm run db:seed        # creates the AR & BA orgs
npm run dev
```

Then just open `http://localhost:3000` — it goes straight to the dashboard.

### Environment variables

| Variable                 | Purpose                                                              |
| ------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`            | Postgres connection string (can be a pooled one, e.g. PgBouncer)      |
| `DATABASE_URL_UNPOOLED`   | Direct/non-pooled connection — required by `prisma db push`/`migrate` |
| `CRM_API_KEY`             | Bearer token required by the `/api/*` automation endpoints            |
| `UPLOAD_DIR`              | Where survey photos are written on disk if not using Blob storage     |
| `BLOB_READ_WRITE_TOKEN`   | If set (Vercel Blob), survey photos are stored there instead of disk  |

Survey photos go to Vercel Blob storage when `BLOB_READ_WRITE_TOKEN` is set;
otherwise they're written to disk under `UPLOAD_DIR` and served through
`/api/uploads/...`. On a host without persistent disk *and* without Blob
configured, uploaded photos will not survive a redeploy.

On boot, the app (via `instrumentation.ts`) makes sure the AR/BA orgs exist.
On Vercel, the database schema is synced once at build time instead (see the
`vercel-build` script); everywhere else, it also runs automatically on boot.

## Deploying to Vercel

1. In the Vercel dashboard: **Add New → Project** → import this GitHub repo.
   Vercel detects Next.js automatically.
2. Before the first deploy, go to the project's **Storage** tab:
   - **Create Database → Postgres** (via the Neon integration). Connect it to
     the project — this injects several env vars, including `DATABASE_URL`
     and `DATABASE_URL_UNPOOLED`. Both are needed as-is (see the table
     above); no copying required if they're named exactly that.
   - **Create → Blob**, and connect it to the project. This automatically
     adds `BLOB_READ_WRITE_TOKEN` — no copying needed.
3. In **Settings → Environment Variables**, add:
   - `CRM_API_KEY` = a long random string (used by the automation API below)
4. Deploy. The build runs `prisma db push` automatically (see `vercel-build`
   in `package.json`), and the app seeds the AR/BA orgs the first time it
   boots.
5. Your live URL is shown on the project's Overview page (or add a custom
   domain under Settings → Domains).

## Deploying to Railway / Render / Fly (persistent volume instead of Blob)

Same idea, but instead of connecting Blob storage, add a persistent volume
(e.g. mounted at `/data`) and set:

- `DATABASE_URL` = a Postgres connection string (add a Postgres plugin/addon
  on that platform, or use Neon/Supabase there too)
- `UPLOAD_DIR` = `/data/uploads`

`CRM_API_KEY` is the same as above. Schema sync and seeding run automatically
on boot on these platforms.

## Modules

- **Dashboard** — totals, outstanding/paid, and job pipeline counts
- **Leads** — enquiries; "push to pipeline" converts a lead into a Job
- **Jobs** — kanban-style pipeline (New Enquiry → Contacted → Site Visit →
  Quote Sent → Accepted → In Progress → Completed / Invoiced / Lost), with a
  stage history log
- **Contacts** — shared across leads/jobs; looked up by email/phone so the
  same person isn't duplicated
- **Tasks**, **Finance** (invoices), **Calendar**, **Wages**, **Staff**
- **Survey Tool** — start a survey, score each roof section 1–5, record
  condition and notes, attach photos per section, then mark it complete to
  get a printable report (`Print / Save PDF` uses the browser's print dialog)

## Automation API (for Claude / scripts)

Every route under `/api/*` requires:

```
Authorization: Bearer <CRM_API_KEY>
```

Most endpoints take an `org` of `"AR"` or `"BA"` (as a `?org=` query param on
GET requests, or an `"org"` field in the JSON body on POST).

| Method & path                | Purpose                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| `GET /api/orgs`               | List organizations                                                      |
| `GET /api/contacts?org=AR`    | List contacts                                                           |
| `POST /api/contacts`          | Create/update a contact — matched by email/phone if it already exists   |
| `GET /api/leads?org=AR`       | List leads                                                              |
| `POST /api/leads`             | Create a lead, e.g. from a new enquiry                                  |
| `PATCH /api/leads/:id`        | Update a lead's `status`/`value`/`notes`/`title`                        |
| `GET /api/jobs?org=AR&stage=` | List jobs, optionally filtered by pipeline stage                        |
| `POST /api/jobs`              | Create a job directly in the pipeline                                   |
| `PATCH /api/jobs/:id`         | Update job fields, including `stage`                                    |
| `POST /api/jobs/:id/stage`    | **"We want that job"** — move a job to a new pipeline stage             |
| `POST /api/quotes`            | Record a quote — creates/updates a job at `QUOTE_SENT` + an invoice     |

Example — the "yeah, we want that job, push it to the pipeline" flow:

```bash
curl -X POST https://your-crm.example.com/api/jobs/JOB_ID/stage \
  -H "Authorization: Bearer $CRM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"stage": "ACCEPTED", "note": "Confirmed by phone"}'
```

Example — logging a quote so it shows up in Finance and the pipeline:

```bash
curl -X POST https://your-crm.example.com/api/quotes \
  -H "Authorization: Bearer $CRM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org": "AR",
    "contact": { "name": "Jane Smith", "phone": "07000000000" },
    "title": "Full re-roof",
    "value": 4500
  }'
```

Pipeline stage values: `NEW_ENQUIRY`, `CONTACTED`, `SITE_VISIT`, `QUOTE_SENT`,
`ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `INVOICED`, `LOST` (see
`lib/constants.ts`).

## Tech notes

- Next.js App Router, TypeScript, Tailwind CSS v4
- Prisma 5 + Postgres (enum-like fields are stored as plain strings for
  flexibility; valid values are documented as comments in
  `prisma/schema.prisma`)
- No authentication — see the note near the top of this file
- `npm run build` runs a full TypeScript + Next.js production build check
