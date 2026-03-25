do $$
begin
  if to_regclass('public.site_settings') is not null then
    alter table public.site_settings
      add column if not exists json_value jsonb;

    begin
      update public.site_settings
      set json_value = value::jsonb
      where key = 'hero_carousel_overrides'
        and coalesce(value, '') <> ''
        and json_value is null;
    exception
      when others then
        raise notice 'hero_carousel_overrides value could not be auto-migrated to json_value';
    end;

    execute 'drop policy if exists "Public can read catalog setting" on public.site_settings';
    execute $policy$
      create policy "Public can read catalog setting"
      on public.site_settings
      for select
      using (key in ('catalog_path', 'hero_carousel_overrides'))
    $policy$;
  end if;
end;
$$;
