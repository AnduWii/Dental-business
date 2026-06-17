-- =====================================================================
-- Recall — initial schema
-- Missed-call recovery for dental clinics.
--
-- Design principles:
--   * Multi-tenant: every business row carries clinic_id; RLS scopes reads.
--   * Client (dashboard) reads via the anon key + user JWT, gated by RLS.
--   * All writes happen server-side via the service-role key (webhooks,
--     server actions) AFTER an explicit clinic-membership check, so client
--     RLS only needs SELECT policies.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role            as enum ('owner', 'staff');
create type subscription_status  as enum ('pilot', 'active', 'paused', 'canceled');
create type call_status          as enum ('missed', 'completed', 'voicemail', 'failed');
create type conversation_status  as enum ('active', 'needs_attention', 'handled', 'closed');
create type conversation_mode    as enum ('ai', 'human');
create type message_direction    as enum ('inbound', 'outbound');
create type message_sender       as enum ('patient', 'ai', 'staff', 'system');
create type urgency_level        as enum ('unknown', 'low', 'medium', 'high', 'emergency');
create type booking_intent       as enum ('unknown', 'new_patient', 'existing_patient', 'reschedule', 'question', 'not_interested');
create type notification_type    as enum ('new_lead', 'emergency', 'new_message', 'missed_call');
create type notification_channel as enum ('sms', 'email', 'dashboard');
create type notification_status  as enum ('pending', 'sent', 'failed');

-- ---------------------------------------------------------------------
-- clinics  (the tenant)
-- ---------------------------------------------------------------------
create table clinics (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  timezone                    text not null default 'America/Toronto',
  -- The Twilio number that receives forwarded (missed) calls AND sends texts.
  twilio_number               text unique,
  twilio_messaging_service_sid text,
  -- Front-desk mobile that gets "paged" by SMS when a lead comes in (E.164).
  notify_phone                text,
  notify_email                text,
  -- First automatic text-back sent the instant a call is missed.
  textback_message            text not null default
    'Hi, this is {{clinic}}. Sorry we missed your call — we''re with a patient. Reply here and we''ll get you sorted. How can we help?',
  ai_enabled                  boolean not null default true,
  ai_greeting                 text,
  subscription_status         subscription_status not null default 'pilot',
  pilot_ends_at               timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- profiles  (links a Supabase auth user to a clinic)
-- ---------------------------------------------------------------------
create table profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  clinic_id   uuid references clinics(id) on delete set null,
  full_name   text,
  role        user_role not null default 'owner',
  created_at  timestamptz not null default now()
);
create index profiles_clinic_idx on profiles(clinic_id);

-- ---------------------------------------------------------------------
-- patients  (the callers — one row per phone number per clinic)
-- ---------------------------------------------------------------------
create table patients (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  phone           text not null,                 -- E.164
  name            text,
  opted_out       boolean not null default false, -- set true on STOP
  first_seen_at   timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  unique (clinic_id, phone)
);

-- ---------------------------------------------------------------------
-- conversations  (one ongoing SMS thread; also holds the captured lead)
-- ---------------------------------------------------------------------
create table conversations (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  patient_id      uuid not null references patients(id) on delete cascade,
  status          conversation_status not null default 'active',
  mode            conversation_mode   not null default 'ai',  -- ai = autopilot, human = staff took over
  -- Captured lead fields (the whole point of V1):
  caller_name     text,
  reason          text,
  urgency_level   urgency_level  not null default 'unknown',
  booking_intent  booking_intent not null default 'unknown',
  intake_complete boolean not null default false,
  summary         text,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index conversations_clinic_status_idx on conversations(clinic_id, status);
create index conversations_clinic_recent_idx on conversations(clinic_id, last_message_at desc);

-- ---------------------------------------------------------------------
-- messages  (every inbound/outbound SMS)
-- ---------------------------------------------------------------------
create table messages (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction       message_direction not null,
  sender          message_sender not null,
  body            text not null,
  twilio_sid      text unique,            -- dedupe inbound webhooks / track delivery
  status          text,                   -- queued | sent | delivered | failed | received
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on messages(conversation_id, created_at);

-- ---------------------------------------------------------------------
-- call_events  (audit log of missed calls — also the "proof" the sale
-- is built on: "let's measure how many calls you actually missed")
-- ---------------------------------------------------------------------
create table call_events (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  patient_id      uuid references patients(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  twilio_call_sid text unique,
  from_number     text,
  to_number       text,
  forwarded_from  text,
  status          call_status not null default 'missed',
  textback_sent   boolean not null default false,
  occurred_at     timestamptz not null default now()
);
create index call_events_clinic_idx on call_events(clinic_id, occurred_at desc);

-- ---------------------------------------------------------------------
-- notifications  (clinic-facing alert feed; also records SMS/email pages)
-- ---------------------------------------------------------------------
create table notifications (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  type            notification_type not null,
  channel         notification_channel not null default 'dashboard',
  title           text,
  body            text,
  read_at         timestamptz,
  status          notification_status not null default 'pending',
  created_at      timestamptz not null default now()
);
create index notifications_clinic_idx on notifications(clinic_id, created_at desc);

-- =====================================================================
-- Triggers
-- =====================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger clinics_set_updated_at
  before update on clinics
  for each row execute function set_updated_at();

create trigger conversations_set_updated_at
  before update on conversations
  for each row execute function set_updated_at();

-- Bump the parent conversation whenever a message lands.
create or replace function touch_conversation_on_message()
returns trigger language plpgsql as $$
begin
  update conversations
     set last_message_at = new.created_at,
         updated_at      = now()
   where id = new.conversation_id;
  return new;
end; $$;

create trigger messages_touch_conversation
  after insert on messages
  for each row execute function touch_conversation_on_message();

-- =====================================================================
-- Row Level Security
-- =====================================================================

-- Returns the clinic_id(s) the current user belongs to. SECURITY DEFINER so
-- it can read profiles without tripping that table's own RLS (no recursion).
create or replace function public.user_clinic_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from public.profiles
   where user_id = auth.uid() and clinic_id is not null;
$$;

alter table clinics       enable row level security;
alter table profiles      enable row level security;
alter table patients      enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table call_events   enable row level security;
alter table notifications enable row level security;

-- Clients get READ access scoped to their clinic. Every write is performed
-- server-side with the service-role key (which bypasses RLS) after an
-- explicit membership check, so no client-side write policies are needed.

create policy "own profile" on profiles
  for select using (user_id = auth.uid());

create policy "own clinic" on clinics
  for select using (id in (select user_clinic_ids()));

create policy "clinic patients" on patients
  for select using (clinic_id in (select user_clinic_ids()));

create policy "clinic conversations" on conversations
  for select using (clinic_id in (select user_clinic_ids()));

create policy "clinic messages" on messages
  for select using (clinic_id in (select user_clinic_ids()));

create policy "clinic call_events" on call_events
  for select using (clinic_id in (select user_clinic_ids()));

create policy "clinic notifications" on notifications
  for select using (clinic_id in (select user_clinic_ids()));

-- =====================================================================
-- Realtime — let the dashboard receive live inserts/updates.
-- (On Supabase Cloud the publication already exists.)
-- =====================================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table notifications;
