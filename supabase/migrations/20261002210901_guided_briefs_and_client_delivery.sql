alter table public.intakes add column current_step integer not null default 0 check(current_step between 0 and 5), add column revision integer not null default 0;

create function public.rtv_save_brief(p_id text,p_hash text,p_answers text,p_status text,p_stamp text,p_step integer,p_revision integer,p_autosave boolean) returns integer
language plpgsql security invoker set search_path='' as $$
declare next_revision integer;
begin
 if p_status not in ('Draft','Submitted') then raise exception 'Invalid brief status'; end if;
 update public.intakes set answers=p_answers,status=p_status,updated_at=p_stamp,current_step=p_step,revision=revision+1
 where lead_id=p_id and token_hash=p_hash and expires_at>p_stamp and revision=p_revision returning revision into next_revision;
 if not found then raise exception 'brief_conflict'; end if;
 if not p_autosave or p_status='Submitted' then
  insert into public.activities(id,lead_id,actor,action,created_at) values(gen_random_uuid()::text,p_id,'Customer',case when p_status='Submitted' then 'Intake submitted' else 'Intake draft saved' end,p_stamp);
 end if;
 return next_revision;
end $$;
revoke all on function public.rtv_save_brief(text,text,text,text,text,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.rtv_save_brief(text,text,text,text,text,integer,integer,boolean) to service_role;

-- Keep already-open older forms compatible while protecting the new editor's revisions.
create or replace function public.rtv_save_intake(p_id text,p_hash text,p_answers text,p_status text,p_stamp text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 update public.intakes set answers=p_answers,status=p_status,updated_at=p_stamp,revision=revision+1 where lead_id=p_id and token_hash=p_hash and expires_at>p_stamp;
 if not found then raise exception 'Intake link expired or replaced'; end if;
 insert into public.activities(id,lead_id,actor,action,created_at) values(gen_random_uuid()::text,p_id,'Customer',case when p_status='Submitted' then 'Intake submitted' else 'Intake draft saved' end,p_stamp);
end $$;

create table public.client_deliveries(
 id text primary key,
 lead_id text not null references public.leads(id),
 video_id text not null references public.videos(id),
 access_key text not null unique,
 download_file text not null,
 download_label text not null,
 enabled boolean not null default true,
 created_by text not null,
 created_at text not null,
 unique(lead_id,video_id)
);
create index client_deliveries_lead on public.client_deliveries(lead_id);
alter table public.client_deliveries enable row level security;
revoke all on public.client_deliveries from public,anon,authenticated;
grant select,insert,update,delete on public.client_deliveries to service_role;
create function public.rtv_prepare_delivery(p_lead text,p_video text,p_file text,p_label text,p_actor text,p_stamp text,p_key text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.videos where id=p_video and status='Ready' and deleted_at is null for update;
 if not found then raise exception 'Video is no longer ready for delivery'; end if;
 insert into public.client_deliveries(id,lead_id,video_id,access_key,download_file,download_label,enabled,created_by,created_at)
 values(gen_random_uuid()::text,p_lead,p_video,p_key,p_file,p_label,true,p_actor,p_stamp)
 on conflict(lead_id,video_id) do update set access_key=case when client_deliveries.enabled then client_deliveries.access_key else excluded.access_key end,download_file=excluded.download_file,download_label=excluded.download_label,enabled=true;
 insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,p_lead,p_actor,'Finished video prepared',p_label,p_stamp);
end $$;
revoke all on function public.rtv_prepare_delivery(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.rtv_prepare_delivery(text,text,text,text,text,text,text) to service_role;

create function public.rtv_withdraw_trashed_deliveries() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.deleted_at is not null then update public.client_deliveries set enabled=false,access_key=encode(extensions.gen_random_bytes(32),'hex') where video_id=new.id; end if;
 return new;
end $$;
revoke all on function public.rtv_withdraw_trashed_deliveries() from public,anon,authenticated;
create trigger withdraw_trashed_deliveries after update of deleted_at on public.videos for each row execute function public.rtv_withdraw_trashed_deliveries();
notify pgrst,'reload schema';
