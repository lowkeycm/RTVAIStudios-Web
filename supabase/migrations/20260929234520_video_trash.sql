-- Recoverable removal: keep source files and records, revoke publication/sharing.
alter table public.videos add column deleted_at timestamptz;
alter table public.videos add constraint videos_trash_private_check
 check (deleted_at is null or (published = 0 and not share_enabled));
comment on column public.videos.deleted_at is 'Recoverable studio Trash. Restoring leaves publication and sharing disabled.';
