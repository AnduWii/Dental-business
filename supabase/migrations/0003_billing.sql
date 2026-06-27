-- =====================================================================
-- Billing: link a clinic to its Stripe customer/subscription.
-- subscription_status already exists (pilot | active | paused | canceled);
-- the Stripe webhook keeps it in sync. These columns are additive and safe to
-- run on an existing database.
-- =====================================================================
alter table clinics
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end     timestamptz;

create index if not exists clinics_stripe_customer_idx on clinics(stripe_customer_id);
