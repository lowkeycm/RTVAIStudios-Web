-- Sharing is independent of portfolio publication. Unlisted links are bearer links.
-- Existing uploads stay private unless already published. No storage objects move.
alter table public.videos
  add column share_enabled boolean not null default false,
  add column share_key text not null default replace(gen_random_uuid()::text, '-', ''),
  add column show_cta boolean not null default true;
alter table public.videos add constraint videos_share_key_unique unique (share_key);
alter table public.videos add constraint videos_share_ready_check check (not share_enabled or status = 'Ready');
comment on column public.videos.share_key is 'Unlisted bearer link. Rotate when sharing is disabled; never include in public gallery responses.';
