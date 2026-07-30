-- Moderation warnings table
-- Each row is a single warning issued by a staff member to a user.
-- Warnings expire after 30 days (application-level, checked in commands/warn.ts).
-- At 3+ active warnings the user is automatically muted for 7 days.

create table if not exists public.warnings (
  id          bigint generated always as identity primary key,
  user_id     text not null,                -- Discord user ID
  moderator_id text not null,               -- Discord user ID of staff who issued it
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- Speed up counting active warnings per user
create index if not exists idx_warnings_user_id on public.warnings (user_id, created_at desc);