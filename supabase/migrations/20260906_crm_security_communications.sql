-- Apply after 20260902_sales_crm.sql and 20260821_analytics_and_attribution.sql.
-- Browser users (including authenticated Supabase users) must use the server CRM.
begin;

alter table public.leads enable row level security;
alter table public.meetings enable row level security;
revoke all on table public.leads, public.meetings, public.admin_users, public.lead_activities from public, anon, authenticated;
grant all on table public.leads, public.meetings, public.admin_users to service_role;
grant select, insert on table public.lead_activities to service_role;
revoke update, delete, truncate on table public.lead_activities from service_role;

alter table public.leads add column if not exists attribution jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists msclkid text;
alter table public.meetings add column if not exists attribution jsonb not null default '{}'::jsonb;
alter table public.meetings add column if not exists msclkid text;
alter table public.meetings add column if not exists utm_term text;
alter table public.meetings add column if not exists utm_content text;
alter table public.meetings add column if not exists gbraid text;
alter table public.meetings add column if not exists wbraid text;
create index if not exists leads_campaign_created_idx on public.leads (utm_source, utm_campaign, created_at desc);

-- Opening a client, an SMTP acceptance, a stage change and a website booking
-- do not prove a conversation happened. Only explicit employee reports do.
create or replace function public.crm_touch_lead_from_activity()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  confirmed_contact boolean := new.metadata->>'contactConfirmed' = 'true'
    and new.metadata->>'source' = 'employee_report'
    and new.activity_type in ('call', 'whatsapp', 'email', 'meeting', 'site_visit');
begin
  update public.leads
     set last_activity_at = greatest(last_activity_at, new.created_at),
         first_contacted_at = case when confirmed_contact
           then least(coalesce(first_contacted_at, new.created_at), new.created_at) else first_contacted_at end,
         last_contacted_at = case when confirmed_contact
           then greatest(last_contacted_at, new.created_at) else last_contacted_at end,
         read = case when confirmed_contact then true else read end,
         last_modified_by = new.actor_id,
         last_modified_name = coalesce(nullif(new.actor_name, ''), 'System'),
         last_modified_email = coalesce(new.actor_email, '')
   where id = new.lead_id;
  return new;
end;
$$;

-- Avoid misleading update entries for an unchanged field value.
drop trigger if exists crm_log_lead_update on public.leads;
create trigger crm_log_lead_update
after update of status, priority, assigned_to, next_follow_up_at, estimated_value,
  name, email, phone, company, machine_interest, message on public.leads
for each row when (
  (old.status, old.priority, old.assigned_to, old.next_follow_up_at, old.estimated_value,
   old.name, old.email, old.phone, old.company, old.machine_interest, old.message)
  is distinct from
  (new.status, new.priority, new.assigned_to, new.next_follow_up_at, new.estimated_value,
   new.name, new.email, new.phone, new.company, new.machine_interest, new.message)
) execute function public.crm_log_lead_update();

create or replace function public.crm_log_new_lead()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.lead_activities
    (lead_id, activity_type, body, actor_id, actor_name, actor_email, metadata)
  values (
    new.id, 'created',
    case when new.origin = 'manual' then 'Lead added manually to the CRM.'
      when new.origin = 'import' then 'Lead imported into the CRM.'
      else 'New lead received from the website.' end,
    new.created_by,
    case when new.created_by is null then 'Website'
      else coalesce(nullif(new.created_by_name, ''),
        (select coalesce(nullif(display_name, ''), email) from public.admin_users where user_id::text = new.created_by),
        'Team member') end,
    coalesce(new.created_by_email, ''),
    jsonb_build_object('source', coalesce(new.source, ''), 'origin', new.origin)
  );
  return new;
end;
$$;

-- Called only by service_role RPCs after the NextAuth session is checked.
-- Revalidate database staff in the same transaction and hold their access row.
create or replace function public.crm_assert_actor_access(p_actor_id text, p_owner_access boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare actor_role text;
begin
  if p_owner_access and p_actor_id like 'env-admin:%' then return; end if;
  select lower(role) into actor_role from public.admin_users
    where user_id::text = p_actor_id and active = true for share;
  if actor_role is null or actor_role not in ('owner', 'admin', 'superadmin', 'staff', 'sales', 'employee')
    or (p_owner_access and actor_role not in ('owner', 'admin', 'superadmin')) then
    raise exception 'CRM access denied.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.crm_record_activity(
  p_lead_id uuid, p_actor_id text, p_actor_name text, p_actor_email text,
  p_owner_access boolean, p_activity_type text, p_body text, p_outcome text, p_metadata jsonb
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare activity public.lead_activities;
begin
  perform public.crm_assert_actor_access(p_actor_id, p_owner_access);
  perform 1 from public.leads where id = p_lead_id
    and (p_owner_access or assigned_to = p_actor_id) for update;
  if not found then raise exception 'Lead access denied.' using errcode = '42501'; end if;
  insert into public.lead_activities
    (lead_id, activity_type, body, outcome, actor_id, actor_name, actor_email, metadata)
  values (p_lead_id, p_activity_type, p_body, p_outcome, p_actor_id, p_actor_name, p_actor_email, p_metadata)
  returning * into activity;
  return to_jsonb(activity);
end;
$$;

-- One durable reservation per draft UUID prevents duplicate SMTP submissions
-- after a network failure or repeated click, even across server instances.
create table if not exists public.crm_communications (
  id uuid primary key,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id text not null,
  actor_name text not null,
  actor_email text not null default '',
  recipient text not null,
  subject text not null check (char_length(subject) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'uncertain', 'failed')),
  activity_id uuid references public.lead_activities(id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists crm_communications_actor_created_idx
  on public.crm_communications(actor_id, created_at desc);
alter table public.crm_communications enable row level security;
revoke all on table public.crm_communications from public, anon, authenticated;
grant select on table public.crm_communications to service_role;

create or replace function public.crm_reserve_email(
  p_request_id uuid, p_lead_id uuid, p_actor_id text, p_actor_name text,
  p_actor_email text, p_owner_access boolean, p_recipient text, p_subject text, p_body text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  reservation public.crm_communications;
  activity public.lead_activities;
  current_email text;
begin
  perform public.crm_assert_actor_access(p_actor_id, p_owner_access);
  -- Serialize per-actor reservations so the sending quota is distributed and atomic.
  perform pg_advisory_xact_lock(hashtext('crm-email:' || p_actor_id));
  select email into current_email from public.leads where id = p_lead_id
    and (p_owner_access or assigned_to = p_actor_id) for update;
  if not found then raise exception 'Lead access denied.' using errcode = '42501'; end if;
  select * into reservation from public.crm_communications where id = p_request_id;
  if found then
    if reservation.actor_id <> p_actor_id or reservation.lead_id <> p_lead_id
      or reservation.subject <> p_subject or reservation.body <> p_body
      or reservation.recipient <> p_recipient then
      raise exception 'Email request ID was already used for another request.' using errcode = '42501';
    end if;
    select * into activity from public.lead_activities where id = reservation.activity_id;
    return jsonb_build_object('created', false, 'status', reservation.status, 'activity', to_jsonb(activity));
  end if;
  if trim(coalesce(current_email, '')) <> p_recipient then
    raise exception 'Lead email changed. Refresh the lead before sending.' using errcode = '42501';
  end if;
  if (select count(*) from public.crm_communications
      where actor_id = p_actor_id and created_at > now() - interval '15 minutes') >= 15 then
    raise exception 'Email sending limit reached. Wait 15 minutes before another send.' using errcode = 'P0001';
  end if;
  insert into public.crm_communications (id, lead_id, actor_id, actor_name, actor_email, recipient, subject, body)
    values (p_request_id, p_lead_id, p_actor_id, p_actor_name, p_actor_email, p_recipient, p_subject, p_body);
  insert into public.lead_activities (lead_id, activity_type, body, actor_id, actor_name, actor_email, metadata)
    values (p_lead_id, 'email_pending', 'Email submission reserved: ' || p_subject,
      p_actor_id, p_actor_name, p_actor_email,
      jsonb_build_object('requestId', p_request_id, 'channel', 'email', 'status', 'pending', 'contactConfirmed', false))
    returning * into activity;
  update public.crm_communications set activity_id = activity.id where id = p_request_id;
  return jsonb_build_object('created', true, 'status', 'pending', 'activity', to_jsonb(activity));
end;
$$;

create or replace function public.crm_finish_email(p_request_id uuid, p_actor_id text, p_status text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare reservation public.crm_communications; activity public.lead_activities;
begin
  if p_status not in ('accepted', 'uncertain', 'failed') then raise exception 'Invalid email status.'; end if;
  select * into reservation from public.crm_communications
    where id = p_request_id and actor_id = p_actor_id for update;
  if not found then raise exception 'Communication access denied.' using errcode = '42501'; end if;
  if reservation.status <> 'pending' then
    select * into activity from public.lead_activities where id = reservation.activity_id;
    return to_jsonb(activity);
  end if;
  -- Always preserve the outcome, even if this employee was deactivated or the
  -- lead reassigned while SMTP was processing the already-reserved message.
  insert into public.lead_activities (lead_id, activity_type, body, actor_id, actor_name, actor_email, metadata)
    values (reservation.lead_id, 'email_' || p_status,
      case p_status when 'accepted' then 'Email accepted by the email server; delivery is not confirmed: '
        when 'uncertain' then 'Email submission result is uncertain. Verify with the email provider: '
        else 'Email was not submitted: ' end || reservation.subject,
      reservation.actor_id, reservation.actor_name, reservation.actor_email,
      jsonb_build_object('requestId', p_request_id, 'channel', 'email', 'status', p_status, 'contactConfirmed', false))
    returning * into activity;
  update public.crm_communications set status = p_status, finished_at = now(), activity_id = activity.id
    where id = p_request_id;
  return to_jsonb(activity);
end;
$$;

-- Disabled staff lose access on the next request; their leads return to the
-- owner assignment queue and the existing assignment trigger records each change.
create or replace function public.crm_unassign_disabled_employee()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if old.active and not new.active then
    update public.leads set assigned_to = null, last_modified_by = null,
      last_modified_name = 'System (employee deactivated)', last_modified_email = ''
      where assigned_to = new.user_id::text;
  end if;
  return new;
end;
$$;
drop trigger if exists crm_unassign_disabled_employee on public.admin_users;
create trigger crm_unassign_disabled_employee after update of active on public.admin_users
  for each row execute function public.crm_unassign_disabled_employee();

-- Preserve campaign provenance when meeting enquiries enter the lead pipeline.
create or replace function public.crm_link_meeting_to_lead()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare linked_lead_id uuid;
begin
  if new.lead_id is not null then return new; end if;
  insert into public.leads (
    name, email, phone, company, product_id, category_id, machine_interest, message,
    source, origin, priority, landing_path, referrer, utm_source, utm_medium,
    utm_campaign, utm_term, utm_content, gclid, gbraid, wbraid, msclkid, attribution
  ) values (
    new.name, new.email, new.phone, new.company, new.product_id, new.category_id,
    new.machine_interest, coalesce(nullif(new.message, ''), 'Meeting requested for ' || new.date || ' at ' || new.time),
    coalesce(nullif(new.source, ''), 'meeting-page'), 'website', 'high',
    new.landing_path, new.referrer, new.utm_source, new.utm_medium, new.utm_campaign,
    new.utm_term, new.utm_content, new.gclid, new.gbraid, new.wbraid, new.msclkid, new.attribution
  ) returning id into linked_lead_id;
  update public.meetings set lead_id = linked_lead_id where id = new.id;
  insert into public.lead_activities (lead_id, activity_type, body, actor_name, metadata)
    values (linked_lead_id, 'meeting_booked',
      'Customer booked a website meeting for ' || new.date || ' at ' || new.time || '.', 'Website',
      jsonb_build_object('meeting_id', new.id, 'meeting_date', new.date,
        'meeting_time', new.time, 'contactConfirmed', false));
  return new;
end;
$$;

-- SQL functions otherwise inherit EXECUTE for PUBLIC by default.
revoke all on function public.crm_assert_actor_access(text, boolean) from public, anon, authenticated;
revoke all on function public.crm_record_activity(uuid, text, text, text, boolean, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.crm_reserve_email(uuid, uuid, text, text, text, boolean, text, text, text) from public, anon, authenticated;
revoke all on function public.crm_finish_email(uuid, text, text) from public, anon, authenticated;
grant execute on function public.crm_assert_actor_access(text, boolean) to service_role;
grant execute on function public.crm_record_activity(uuid, text, text, text, boolean, text, text, text, jsonb) to service_role;
grant execute on function public.crm_reserve_email(uuid, uuid, text, text, text, boolean, text, text, text) to service_role;
grant execute on function public.crm_finish_email(uuid, text, text) to service_role;

comment on table public.crm_communications is 'Private durable email reservations. Accepted means SMTP acceptance, not confirmed delivery. Never automatically retry pending or uncertain submissions.';
commit;
