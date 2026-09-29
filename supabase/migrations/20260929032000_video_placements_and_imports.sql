-- Reversible copies of the existing catalog. Source objects remain untouched.
create table public.video_imports (
 video_id text primary key references public.videos(id),
 bunny_id text not null default '',
 state text not null default 'queued' check (state in ('queued','requested','processing','complete','error')),
 error text not null default '',
 updated_at timestamptz not null default now()
);
alter table public.video_imports enable row level security;
revoke all on public.video_imports from anon, authenticated;
grant all on public.video_imports to service_role;

insert into public.settings(key,value) values ('video_placements',
 '{"hero":["rtv-bang","rtv-impossible","rtv-laced-01","rtv-brand","rtv-heritage-coaches","rtv-santa-director"],"examples":{"spot":"rtv-bang","impossible":"rtv-impossible","avatar":"rtv-brand","universe":"rtv-laced-01"},"openers":{"spot":"rtv-bang","impossible":"rtv-impossible","avatar":"rtv-brand","universe":"rtv-laced-01"},"order":["rtv-impossible","rtv-brand","rtv-laced-01","rtv-laced-02","rtv-laced-03","rtv-boring-epic","rtv-bang","rtv-santa-director","rtv-heritage-coaches","rtv-heritage-fees","rtv-heritage-returns","rtv-deathcast","rtv-horus-seth"]}')
 on conflict (key) do nothing;

create function public.rtv_activate_bunny_import(p_id text, p_bunny_id text)
returns boolean language plpgsql security invoker set search_path=public as $$
begin
 perform 1 from public.video_imports where video_id=p_id and bunny_id=p_bunny_id and state='processing' for update;
 if not found then return false; end if;
 update public.videos set provider='bunny',object_key=p_bunny_id,source='/api/playback/'||p_id,updated_at=now()::text where id=p_id;
 update public.video_imports set state='complete',error='',updated_at=now() where video_id=p_id;
 return true;
end;
$$;
revoke all on function public.rtv_activate_bunny_import(text,text) from public, anon, authenticated;
grant execute on function public.rtv_activate_bunny_import(text,text) to service_role;
