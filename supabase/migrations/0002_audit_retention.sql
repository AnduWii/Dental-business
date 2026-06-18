-- =====================================================================
-- Recall — audit trail + data retention / erasure
-- Adds an append-only audit log (tamper-resistant at the DB level) and
-- functions for right-to-erasure and retention purges.
-- =====================================================================

-- ---------------------------------------------------------------------
-- audit_log — who did what, when. Append-only.
-- ---------------------------------------------------------------------
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid references clinics(id) on delete set null,
  actor_email text,                 -- staff/admin email, or 'system'
  action      text not null,        -- e.g. 'staff.reply', 'conversation.takeover'
  target      text,                 -- entity id/description
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_clinic_idx on audit_log(clinic_id, created_at desc);

alter table audit_log enable row level security;

-- Clinic members can read their own clinic's audit entries (admins read all
-- via the service role on /admin). No write policy: only the service role
-- inserts, and the trigger below blocks any update/delete entirely.
drop policy if exists "clinic audit read" on audit_log;
create policy "clinic audit read" on audit_log
  for select using (clinic_id in (select user_clinic_ids()));

-- Tamper resistance: make the table append-only. Triggers fire even for the
-- service role, so nobody (app or dashboard) can rewrite history.
create or replace function prevent_audit_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end; $$;

drop trigger if exists audit_no_update on audit_log;
drop trigger if exists audit_no_delete on audit_log;
create trigger audit_no_update before update on audit_log
  for each row execute function prevent_audit_mutation();
create trigger audit_no_delete before delete on audit_log
  for each row execute function prevent_audit_mutation();

-- ---------------------------------------------------------------------
-- Right-to-erasure: delete one patient's data within a clinic.
-- (Conversations/messages/call_events cascade from patients.)
-- ---------------------------------------------------------------------
create or replace function erase_patient(p_clinic uuid, p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from patients where clinic_id = p_clinic and phone = p_phone;
end; $$;

-- Delete an entire clinic and everything under it (account closure).
create or replace function erase_clinic(p_clinic uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from clinics where id = p_clinic;  -- cascades to all child rows
end; $$;

-- Retention: purge closed conversations (and their messages) older than N days.
-- Run on a schedule with pg_cron, or manually. Defaults to 365 days.
create or replace function purge_old_conversations(p_days int default 365)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  with gone as (
    delete from conversations
     where status = 'closed'
       and last_message_at < now() - make_interval(days => p_days)
    returning 1
  )
  select count(*) into deleted from gone;
  return deleted;
end; $$;

-- These maintenance functions are service-role/operator only.
revoke all on function erase_patient(uuid, text) from public, anon, authenticated;
revoke all on function erase_clinic(uuid) from public, anon, authenticated;
revoke all on function purge_old_conversations(int) from public, anon, authenticated;
