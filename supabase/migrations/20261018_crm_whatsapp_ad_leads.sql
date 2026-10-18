-- New WhatsApp enquiries become CRM leads, with Click-to-WhatsApp ad
-- referral metadata retained for source attribution. Apply after 20260926_crm_integrations.sql.
begin;

create or replace function public.crm_ingest_provider_event(p_event jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  event_id uuid;
  matched uuid;
  matches uuid[];
  phone_digits text := coalesce(p_event->>'phone', '');
  source_name text;
  source_medium text;
  display_name text;
  lead_message text;
begin
  if p_event->>'provider' not in ('whatsapp','twilio')
    or length(p_event->>'event_key') not between 1 and 250
    or p_event->>'direction' not in ('inbound','outbound','unknown')
    or length(phone_digits) > 20 then
    raise exception 'Invalid provider event';
  end if;

  if phone_digits ~ '^[1-9][0-9]{7,14}$' then
    select array_agg(id) into matches from public.leads
      where regexp_replace(coalesce(phone,''),'[^0-9]','','g')=phone_digits;
    if array_length(matches,1)=1 then matched := matches[1]; end if;
  else
    phone_digits := '';
  end if;

  insert into public.crm_provider_events(provider,event_key,external_id,phone,direction,kind,status,body,occurred_at,metadata,lead_id)
  values(p_event->>'provider',p_event->>'event_key',p_event->>'external_id',phone_digits,p_event->>'direction',p_event->>'kind',p_event->>'status',left(coalesce(p_event->>'body',''),4000),(p_event->>'occurred_at')::timestamptz,coalesce(p_event->'metadata','{}'::jsonb),matched)
  on conflict(provider,event_key) do nothing returning id into event_id;
  if event_id is null then return null; end if;

  -- A unique phone match is attached to its existing record. If there are no
  -- matches, create one CRM lead from a real inbound WhatsApp message. Multiple
  -- existing records remain unmatched for staff review to avoid false merges.
  if matched is null and p_event->>'provider'='whatsapp'
    and p_event->>'direction'='inbound' and p_event->>'kind'='message'
    and phone_digits ~ '^[1-9][0-9]{7,14}$' and matches is null then
    source_name := case
      when p_event->'metadata'->>'referral_source_type'='ad'
        and nullif(p_event->'metadata'->>'referral_source_id','') is not null
        then 'meta-click-to-whatsapp'
      else 'whatsapp-inbound'
    end;
    source_medium := case when source_name='meta-click-to-whatsapp' then 'paid_social' else 'messaging' end;
    display_name := coalesce(nullif(left(trim(p_event->'metadata'->>'contact_name'),180),''), 'WhatsApp enquiry +' || phone_digits);
    lead_message := left(coalesce(p_event->>'body',''),3000);
    if source_name='meta-click-to-whatsapp' then
      lead_message := left(concat_ws(E'\n', nullif(lead_message,''),
        'Meta Click-to-WhatsApp referral: ad ' || left(p_event->'metadata'->>'referral_source_id',160),
        nullif('Ad headline: ' || left(p_event->'metadata'->>'referral_headline',300), 'Ad headline: '),
        nullif('Ad source: ' || left(p_event->'metadata'->>'referral_source_url',1000), 'Ad source: ')),4000);
    end if;
    insert into public.leads(name,email,phone,company,machine_interest,message,source,origin,priority,read,utm_source,utm_medium,utm_content)
    values(display_name,'',phone_digits,'','',coalesce(lead_message,'WhatsApp enquiry received.'),source_name,'import','high',false,
      case when source_name='meta-click-to-whatsapp' then 'meta' else 'whatsapp' end,source_medium,
      nullif(left(p_event->'metadata'->>'referral_source_id',160),''))
    returning id into matched;
    update public.crm_provider_events set lead_id=matched where id=event_id;
  end if;

  if matched is not null then
    insert into public.lead_activities(lead_id,activity_type,body,outcome,actor_name,metadata,created_at)
    values(matched,'provider_event',left(coalesce(p_event->>'body',''),4000),p_event->>'status',p_event->>'provider',
      jsonb_build_object('source','verified_webhook','provider',p_event->>'provider','event_id',event_id,'kind',p_event->>'kind','contactConfirmed',false)
        || coalesce(p_event->'metadata','{}'::jsonb),now());
  end if;
  return event_id;
end; $$;

revoke all on function public.crm_ingest_provider_event(jsonb) from public,anon,authenticated;
grant execute on function public.crm_ingest_provider_event(jsonb) to service_role;
commit;
