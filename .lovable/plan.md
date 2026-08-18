# Self-hosted migration: full schema export

## What you can and cannot take with you

| Item | Status |
| --- | --- |
| Backend URL + project ref | Already in your project's `.env` — copy freely |
| Publishable / anon key | Already in `.env` — safe to copy |
| Service role key + database password | **Not available on Lovable Cloud.** Cannot be retrieved or displayed. A self-hosted Postgres has its own credentials anyway, so this is not a blocker |
| Stripe live/test secret keys | Yours, not Lovable's — get them from your Stripe dashboard under Developers → API keys |
| Stripe webhook signing secrets | Set by you; re-read or rotate them in Stripe |

Because you are moving to your own database, none of the managed keys need to travel. What you need is the schema.

## What I will produce

A single runnable SQL file you can execute against a fresh Postgres instance, covering the whole `public` schema (25 tables):

- Enum types: `app_role`, `entitlement_source`, `product_collection`, `product_status`
- All 25 table definitions with columns, types, defaults, NOT NULL, primary keys, unique constraints and check constraints
- Foreign keys, including the `auth.users` references (emitted as commented-out statements with a note, since a self-hosted stack will not have Supabase's `auth` schema unless you recreate it)
- Indexes
- All 17 database functions (`has_role`, `has_active_membership`, `monthly_leaderboard`, the email queue helpers, etc.)
- All triggers, including the `updated_at` triggers and the `on_auth_user_created` hook
- Row Level Security enablement plus every policy, and the GRANT statements per table

## Portability notes included in the file

The export will carry a header section flagging the Supabase-specific dependencies you must resolve on a self-hosted stack:

- `auth.uid()` — every RLS policy uses it; you need an equivalent function or a rewrite to your own auth model
- `auth.users` — foreign key target for most user tables
- Extensions: `pgmq` (email queues), `pg_net` (outbound HTTP), `pg_cron` (scheduled dispatch), `vault` (secret storage)
- The email queue functions call a Lovable-hosted URL and read from `vault` — these will not work as-is off-platform

## Deliverable

`/mnt/documents/seven3seven-schema.sql` — download it from the project files.

Data rows are not included in this export (you selected schema only). If you want the data too, Cloud → Advanced settings → Export data produces a full export, or I can export specific tables to CSV on request.

## Scope

No application code changes. This is a read-only export; nothing in the running app is modified.
