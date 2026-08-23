-- =====================================================================
-- Verticals: Catchline now serves more than dental clinics.
--
-- Adds clinics.vertical so each business is tagged with the industry it
-- operates in. The AI intake prompt, notification wording, and default
-- text-back copy key off this value. Existing rows stay 'dental'.
--
-- The app degrades gracefully while this migration is unapplied: reads use
-- select("*") (a missing column simply reads as undefined and the code
-- defaults to 'dental'), and writes retry without the column if Postgres
-- rejects it.
-- =====================================================================
alter table clinics
  add column if not exists vertical text not null default 'dental'
  check (vertical in ('dental', 'real_estate'));

comment on column clinics.vertical is
  'Industry the business operates in. Drives intake prompts and copy.';
