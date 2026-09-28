-- Repurpose PopOff while retaining an owner-only rollback archive.
-- Storage objects, bucket IDs, public video URLs and auth users are preserved.
create schema popoff_archive;
revoke all on schema popoff_archive from public,anon,authenticated,service_role;
drop trigger if exists on_auth_user_created on auth.users;
alter table public.agent_registry set schema popoff_archive;
alter table public.background_jobs set schema popoff_archive;
alter table public.blog_posts set schema popoff_archive;
alter table public.brand_assistant_sessions set schema popoff_archive;
alter table public.brand_reflections set schema popoff_archive;
alter table public.content_entries set schema popoff_archive;
alter table public.content_feedback set schema popoff_archive;
alter table public.content_ideas set schema popoff_archive;
alter table public.content_transformations set schema popoff_archive;
alter table public.error_logs set schema popoff_archive;
alter table public.error_responses set schema popoff_archive;
alter table public.execution_logs set schema popoff_archive;
alter table public.generated_images set schema popoff_archive;
alter table public.journal_entries set schema popoff_archive;
alter table public.knowledge_base_documents set schema popoff_archive;
alter table public.lora_models set schema popoff_archive;
alter table public.microtopics set schema popoff_archive;
alter table public.newsletter_preferences set schema popoff_archive;
alter table public.newsletters set schema popoff_archive;
alter table public.personal_stories set schema popoff_archive;
alter table public.profiles set schema popoff_archive;
alter table public.research_cache set schema popoff_archive;
alter table public.rss_articles set schema popoff_archive;
alter table public.rss_feeds set schema popoff_archive;
alter table public.scheduled_posts set schema popoff_archive;
alter table public.story_usage_log set schema popoff_archive;
alter table public.subscription_plans set schema popoff_archive;
alter table public.transactions set schema popoff_archive;
alter table public.usage_tracking set schema popoff_archive;
alter table public.user_cms_accounts set schema popoff_archive;
alter table public.user_roles set schema popoff_archive;
alter table public.user_social_accounts set schema popoff_archive;
alter table public.user_tone_guide_history set schema popoff_archive;
alter table public.user_tone_profiles set schema popoff_archive;
alter table public.user_weekly_focus set schema popoff_archive;
alter table public.videos set schema popoff_archive;
alter table public.voice_calibration_examples set schema popoff_archive;
alter function public.handle_new_user() set schema popoff_archive;
alter function public.log_tone_guide_changes() set schema popoff_archive;
alter function public.update_tone_profile_timestamp() set schema popoff_archive;
revoke all on all tables in schema popoff_archive from public,anon,authenticated,service_role;
revoke all on all functions in schema popoff_archive from public,anon,authenticated,service_role;
CREATE TABLE members (
	email text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	role text NOT NULL,
	rep_code text NOT NULL,
	active integer DEFAULT 1 NOT NULL,
	created_at text NOT NULL
);

CREATE UNIQUE INDEX members_rep_code ON members (rep_code);

CREATE TABLE leads (
	id text PRIMARY KEY NOT NULL,
	company text NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	phone text DEFAULT '' NOT NULL,
	website text DEFAULT '' NOT NULL,
	product text DEFAULT 'unsure' NOT NULL,
	stage text DEFAULT 'New' NOT NULL,
	source text DEFAULT 'Website' NOT NULL,
	origin_rep text DEFAULT '' NOT NULL,
	owner_email text DEFAULT '' NOT NULL,
	campaign text DEFAULT '' NOT NULL,
	notes text DEFAULT '' NOT NULL,
	next_action text DEFAULT '' NOT NULL,
	next_at text DEFAULT '' NOT NULL,
	preferred_time text DEFAULT '' NOT NULL,
	timezone text DEFAULT '' NOT NULL,
	calendar_event text DEFAULT '' NOT NULL,
	created_by text NOT NULL,
	created_at text NOT NULL,
	updated_at text NOT NULL
);

CREATE UNIQUE INDEX leads_contact_company ON leads (email,company);

CREATE INDEX leads_owner_stage ON leads (owner_email,stage);

CREATE INDEX leads_origin ON leads (origin_rep);

CREATE TABLE intakes (
	lead_id text PRIMARY KEY NOT NULL,
	token_hash text DEFAULT '' NOT NULL,
	expires_at text DEFAULT '' NOT NULL,
	answers text DEFAULT '{}' NOT NULL,
	status text DEFAULT 'Draft' NOT NULL,
	updated_at text NOT NULL,
	FOREIGN KEY (lead_id) REFERENCES leads(id) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX intakes_token ON intakes (token_hash);

CREATE TABLE activities (
	id text PRIMARY KEY NOT NULL,
	lead_id text NOT NULL,
	actor text NOT NULL,
	action text NOT NULL,
	detail text DEFAULT '' NOT NULL,
	created_at text NOT NULL,
	FOREIGN KEY (lead_id) REFERENCES leads(id) ON UPDATE no action ON DELETE no action
);

CREATE INDEX activities_lead ON activities (lead_id);

CREATE TABLE videos (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	product text NOT NULL,
	industry text DEFAULT '' NOT NULL,
	tags text DEFAULT '' NOT NULL,
	description text DEFAULT '' NOT NULL,
	provider text NOT NULL,
	source text DEFAULT '' NOT NULL,
	object_key text DEFAULT '' NOT NULL,
	poster text DEFAULT '/studio/floor.webp' NOT NULL,
	placement text DEFAULT 'gallery' NOT NULL,
	status text DEFAULT 'Awaiting upload' NOT NULL,
	published integer DEFAULT 0 NOT NULL,
	consent integer DEFAULT 0 NOT NULL,
	size bigint DEFAULT 0 NOT NULL,
	content_type text DEFAULT 'video/mp4' NOT NULL,
	uploaded_by text NOT NULL,
	created_at text NOT NULL,
	updated_at text NOT NULL
);

CREATE INDEX videos_public_product ON videos (published,product);

CREATE TABLE settings (
	key text PRIMARY KEY NOT NULL,
	value text NOT NULL
);

CREATE TABLE submissions (
	id text PRIMARY KEY NOT NULL,
	lead_id text NOT NULL,
	token text DEFAULT '' NOT NULL,
	created_at text NOT NULL
);

CREATE TABLE throttle (
	key text PRIMARY KEY NOT NULL,
	count integer DEFAULT 1 NOT NULL,
	updated_at bigint NOT NULL
);
drop index public.leads_contact_company;
create unique index leads_contact_company on public.leads(lower(email),lower(company));
alter table public.members add constraint members_role_check check (role in ('admin','sales','production'));
alter table public.members add constraint members_active_check check (active in (0,1));
alter table public.videos add constraint videos_publication_check check (published=0 or (consent=1 and status='Ready'));
alter table public.members enable row level security;
revoke all on public.members from public,anon,authenticated;
grant select,insert,update,delete on public.members to service_role;
alter table public.leads enable row level security;
revoke all on public.leads from public,anon,authenticated;
grant select,insert,update,delete on public.leads to service_role;
alter table public.intakes enable row level security;
revoke all on public.intakes from public,anon,authenticated;
grant select,insert,update,delete on public.intakes to service_role;
alter table public.activities enable row level security;
revoke all on public.activities from public,anon,authenticated;
grant select,insert,update,delete on public.activities to service_role;
alter table public.videos enable row level security;
revoke all on public.videos from public,anon,authenticated;
grant select,insert,update,delete on public.videos to service_role;
alter table public.settings enable row level security;
revoke all on public.settings from public,anon,authenticated;
grant select,insert,update,delete on public.settings to service_role;
alter table public.submissions enable row level security;
revoke all on public.submissions from public,anon,authenticated;
grant select,insert,update,delete on public.submissions to service_role;
alter table public.throttle enable row level security;
revoke all on public.throttle from public,anon,authenticated;
grant select,insert,update,delete on public.throttle to service_role;

-- Existing users never gain studio access automatically. Access is the members allowlist.
-- The verified owner member is provisioned separately through the admin database connection.

-- Retain the existing public video bucket and remove its old all-user write rules.
drop policy if exists "Users can update their own videos" on storage.objects;
drop policy if exists "Users can delete their own videos" on storage.objects;
drop policy if exists "Authenticated users can upload videos" on storage.objects;
drop policy if exists "Authenticated users can update videos" on storage.objects;
drop policy if exists "Authenticated users can delete videos" on storage.objects;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rtv-production','rtv-production',false,50000000,array['video/mp4','video/webm'])
on conflict(id) do nothing;
-- New uploads are signed by the verified server. No anonymous bucket write policy.

-- These transaction functions are callable only with the server secret key.
create function public.rtv_rate_limit(p_key text,p_time bigint) returns integer
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.throttle(key,count,updated_at) values(p_key,1,p_time)
 on conflict(key) do update set count=public.throttle.count+1 returning count into n;
 delete from public.throttle where updated_at<p_time-86400000;
 return n;
end $$;

create function public.rtv_submit_enquiry(p_request text,p_data jsonb,p_id text,p_token text,p_hash text,p_stamp text,p_expires text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare prior public.submissions; rep public.members; existing text;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_request,0));
 select * into prior from public.submissions where id=p_request;
 if found then return jsonb_build_object('ok',true,'intakeUrl',case when prior.token<>'' then '/intake/'||prior.token else null end);end if;
 perform pg_advisory_xact_lock(hashtextextended(lower(p_data->>'email')||':'||lower(p_data->>'company'),1));
 select * into rep from public.members where rep_code=p_data->>'ref' and active=1 and role in ('admin','sales');
 select id into existing from public.leads where lower(email)=lower(p_data->>'email') and lower(company)=lower(p_data->>'company');
 if existing is not null then
  insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,existing,'Website','New enquiry',jsonb_build_object('product',p_data->>'product','message',p_data->>'notes','preferredTime',p_data->>'preferredTime','timezone',p_data->>'timezone','ref',coalesce(rep.rep_code,''))::text,p_stamp);
  insert into public.submissions(id,lead_id,token,created_at) values(p_request,existing,'',p_stamp);
  return jsonb_build_object('ok',true,'intakeUrl',null);
 end if;
 insert into public.leads(id,company,name,email,phone,website,product,stage,source,origin_rep,owner_email,campaign,notes,preferred_time,timezone,created_by,created_at,updated_at)
 values(p_id,p_data->>'company',p_data->>'name',lower(p_data->>'email'),p_data->>'phone',p_data->>'website',p_data->>'product','Call requested','Website',coalesce(rep.rep_code,''),coalesce(rep.email,''),p_data->>'campaign',p_data->>'notes',p_data->>'preferredTime',p_data->>'timezone','Website',p_stamp,p_stamp);
 insert into public.intakes(lead_id,token_hash,expires_at,answers,status,updated_at) values(p_id,p_hash,p_expires,'{}','Draft',p_stamp);
 insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,p_id,'Website','Enquiry received',case when rep.email is null then 'Direct website enquiry' else 'Attributed to '||rep.name end,p_stamp);
 insert into public.submissions(id,lead_id,token,created_at) values(p_request,p_id,p_token,p_stamp);
 return jsonb_build_object('ok',true,'intakeUrl','/intake/'||p_token);
end $$;

create function public.rtv_save_intake(p_id text,p_hash text,p_answers text,p_status text,p_stamp text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 update public.intakes set answers=p_answers,status=p_status,updated_at=p_stamp where lead_id=p_id and token_hash=p_hash and expires_at>p_stamp;
 if not found then raise exception 'Intake link expired or replaced'; end if;
 insert into public.activities(id,lead_id,actor,action,created_at) values(gen_random_uuid()::text,p_id,'Customer',case when p_status='Submitted' then 'Intake submitted' else 'Intake draft saved' end,p_stamp);
end $$;

create function public.rtv_create_lead(p_id text,p_data jsonb,p_actor text,p_rep text,p_stamp text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 insert into public.leads(id,company,name,email,phone,website,product,source,origin_rep,owner_email,notes,created_by,created_at,updated_at)
 values(p_id,p_data->>'company',p_data->>'name',lower(p_data->>'email'),p_data->>'phone',p_data->>'website',p_data->>'product',p_data->>'source',p_rep,p_actor,p_data->>'notes',p_actor,p_stamp,p_stamp);
 insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,p_id,p_actor,'Lead created','Original rep: '||p_rep,p_stamp);
end $$;

create function public.rtv_update_lead(p_id text,p_changes jsonb,p_actor text,p_action text,p_detail text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 update public.leads set
 stage=coalesce(p_changes->>'stage',stage),product=coalesce(p_changes->>'product',product),next_action=coalesce(p_changes->>'next_action',next_action),next_at=coalesce(p_changes->>'next_at',next_at),owner_email=coalesce(p_changes->>'owner_email',owner_email),preferred_time=coalesce(p_changes->>'preferred_time',preferred_time),calendar_event=coalesce(p_changes->>'calendar_event',calendar_event),updated_at=p_changes->>'updated_at'
 where id=p_id;
 if not found then raise exception 'Lead not found';end if;
 insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,p_id,p_actor,p_action,p_detail,p_changes->>'updated_at');
end $$;

create function public.rtv_rotate_intake(p_id text,p_hash text,p_expires text,p_actor text,p_stamp text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 insert into public.intakes(lead_id,token_hash,expires_at,answers,status,updated_at) values(p_id,p_hash,p_expires,'{}','Draft',p_stamp)
 on conflict(lead_id) do update set token_hash=excluded.token_hash,expires_at=excluded.expires_at,updated_at=excluded.updated_at;
 -- Replayed original form submissions must not disclose a link that was replaced.
 update public.submissions set token='' where lead_id=p_id;
 insert into public.activities(id,lead_id,actor,action,detail,created_at) values(gen_random_uuid()::text,p_id,p_actor,'Private intake link created','Any previous link was replaced.',p_stamp);
end $$;

revoke all on function public.rtv_rate_limit(text,bigint),public.rtv_submit_enquiry(text,jsonb,text,text,text,text,text),public.rtv_save_intake(text,text,text,text,text),public.rtv_create_lead(text,jsonb,text,text,text),public.rtv_update_lead(text,jsonb,text,text,text),public.rtv_rotate_intake(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.rtv_rate_limit(text,bigint),public.rtv_submit_enquiry(text,jsonb,text,text,text,text,text),public.rtv_save_intake(text,text,text,text,text),public.rtv_create_lead(text,jsonb,text,text,text),public.rtv_update_lead(text,jsonb,text,text,text),public.rtv_rotate_intake(text,text,text,text,text) to service_role;
notify pgrst,'reload schema';
