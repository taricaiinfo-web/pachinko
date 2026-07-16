-- ============================================================================
-- パチンコ実働データ管理アプリ - Supabase スキーマ
-- Supabase の SQL Editor でこのファイルの内容をそのまま実行してください。
-- ============================================================================

-- 拡張機能 (UUID生成)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. profiles: ユーザープロフィール
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  bio text,
  avatar_emoji text default '🎰',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 既存プロジェクト向け: 新カラムを追加(既にテーブルがある場合)
alter table public.profiles add column if not exists avatar_url text;

comment on table public.profiles is 'ユーザーの公開プロフィール';

-- ----------------------------------------------------------------------------
-- 2. records: 実働データ (日付, 場所, 機種, 投資額, 回収額)
-- ----------------------------------------------------------------------------
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  -- profiles.id を参照 (profiles.id は auth.users.id と1:1) にすることで
  -- PostgREST の `records.select("*, profiles(...)")` embedding を可能にする
  user_id uuid not null references public.profiles (id) on delete cascade,
  play_date date not null,
  location text not null,
  machine text not null,
  investment integer not null check (investment >= 0),
  payout integer not null check (payout >= 0),
  memo text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 既存プロジェクト向け: 新カラムを追加(既にテーブルがある場合)
alter table public.records add column if not exists is_public boolean not null default true;

comment on table public.records is '1回の実働(遊技)データ。差枚/差玉ではなく投資額・回収額(円)で管理';
comment on column public.records.is_public is 'true: 全ユーザーに公開 / false: 本人のみ閲覧可能';

create index if not exists records_user_id_idx on public.records (user_id);
create index if not exists records_play_date_idx on public.records (play_date desc);

-- ----------------------------------------------------------------------------
-- 3. comments: データへのコメント
-- ----------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

comment on table public.comments is '実働データに対するコメント';

create index if not exists comments_record_id_idx on public.comments (record_id);

-- ----------------------------------------------------------------------------
-- 4. follows: フォロー関係
-- ----------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

comment on table public.follows is 'ユーザー間のフォロー関係';

create index if not exists follows_follower_id_idx on public.follows (follower_id);
create index if not exists follows_followee_id_idx on public.follows (followee_id);

-- ----------------------------------------------------------------------------
-- 5. record_likes: 実働データへのいいね
-- ----------------------------------------------------------------------------
create table if not exists public.record_likes (
  record_id uuid not null references public.records (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (record_id, user_id)
);

comment on table public.record_likes is '実働データへのいいね';

create index if not exists record_likes_record_id_idx on public.record_likes (record_id);

-- ----------------------------------------------------------------------------
-- 6. record_bookmarks: 実働データのブックマーク(本人のみ閲覧可能)
-- ----------------------------------------------------------------------------
create table if not exists public.record_bookmarks (
  record_id uuid not null references public.records (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (record_id, user_id)
);

comment on table public.record_bookmarks is '実働データのブックマーク(本人のみ閲覧可能)';

create index if not exists record_bookmarks_user_id_idx on public.record_bookmarks (user_id);

-- ----------------------------------------------------------------------------
-- 7. notifications: いいね・コメント・フォローの通知
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow')),
  record_id uuid references public.records (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'いいね・コメント・フォローの通知';

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_id, is_read, created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at 自動更新トリガー
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_records_updated_at on public.records;
create trigger set_records_updated_at
  before update on public.records
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 新規ユーザー登録時に自動でプロフィールを作成
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_name text;
  candidate text;
  suffix int := 0;
begin
  base_name := coalesce(split_part(new.email, '@', 1), 'user');
  candidate := base_name;

  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := base_name || suffix::text;
  end loop;

  insert into public.profiles (id, username)
  values (new.id, candidate)
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- 方針: ログイン済みユーザーは、公開設定(is_public = true)のデータと
--       本人のデータ(公開・非公開問わず)を閲覧可能(認証必須アプリ)。
--       書き込み(insert/update/delete)は本人のデータのみ可能。
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.record_likes enable row level security;
alter table public.record_bookmarks enable row level security;
alter table public.notifications enable row level security;

-- profiles
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- records
drop policy if exists "records_select_all" on public.records;
drop policy if exists "records_select_authenticated" on public.records;
create policy "records_select_authenticated"
  on public.records for select
  to authenticated
  using (is_public = true or user_id = auth.uid());

drop policy if exists "records_insert_own" on public.records;
create policy "records_insert_own"
  on public.records for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "records_update_own" on public.records;
create policy "records_update_own"
  on public.records for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "records_delete_own" on public.records;
create policy "records_delete_own"
  on public.records for delete
  to authenticated
  using (auth.uid() = user_id);

-- comments
-- 非公開レコードのコメントは、そのレコードの投稿者以外には見せない
drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_select_authenticated" on public.comments;
create policy "comments_select_authenticated"
  on public.comments for select
  to authenticated
  using (
    exists (
      select 1 from public.records r
      where r.id = comments.record_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- follows
drop policy if exists "follows_select_authenticated" on public.follows;
create policy "follows_select_authenticated"
  on public.follows for select
  to authenticated
  using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- record_likes
-- 非公開レコードのいいねは、そのレコードの投稿者以外には見せない(comments と同じ方針)
drop policy if exists "record_likes_select_authenticated" on public.record_likes;
create policy "record_likes_select_authenticated"
  on public.record_likes for select
  to authenticated
  using (
    exists (
      select 1 from public.records r
      where r.id = record_likes.record_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists "record_likes_insert_own" on public.record_likes;
create policy "record_likes_insert_own"
  on public.record_likes for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.records r
      where r.id = record_likes.record_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists "record_likes_delete_own" on public.record_likes;
create policy "record_likes_delete_own"
  on public.record_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- record_bookmarks
-- ブックマークは本人のみ閲覧可能(他人には非公開)
drop policy if exists "record_bookmarks_select_own" on public.record_bookmarks;
create policy "record_bookmarks_select_own"
  on public.record_bookmarks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "record_bookmarks_insert_own" on public.record_bookmarks;
create policy "record_bookmarks_insert_own"
  on public.record_bookmarks for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.records r
      where r.id = record_bookmarks.record_id
        and (r.is_public = true or r.user_id = auth.uid())
    )
  );

drop policy if exists "record_bookmarks_delete_own" on public.record_bookmarks;
create policy "record_bookmarks_delete_own"
  on public.record_bookmarks for delete
  to authenticated
  using (auth.uid() = user_id);

-- notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (auth.uid() = recipient_id);

drop policy if exists "notifications_insert_own_action" on public.notifications;
create policy "notifications_insert_own_action"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = actor_id and recipient_id <> actor_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ----------------------------------------------------------------------------
-- 便利ビュー: プロフィール情報付きレコード一覧
-- ----------------------------------------------------------------------------
-- テーブルへの列追加で `r.*` の列順序が変わるため、
-- create or replace ではなく毎回 drop してから作り直す。
drop view if exists public.records_with_profile;
create view public.records_with_profile
with (security_invoker = true) as
select
  r.*,
  (r.payout - r.investment) as diff,
  p.username,
  p.avatar_emoji,
  p.avatar_url,
  coalesce(l.like_count, 0) as like_count,
  coalesce(cm.comment_count, 0) as comment_count,
  exists (
    select 1 from public.record_likes rl
    where rl.record_id = r.id and rl.user_id = auth.uid()
  ) as liked_by_me,
  exists (
    select 1 from public.record_bookmarks rb
    where rb.record_id = r.id and rb.user_id = auth.uid()
  ) as bookmarked_by_me
from public.records r
join public.profiles p on p.id = r.user_id
left join (
  select record_id, count(*) as like_count from public.record_likes group by record_id
) l on l.record_id = r.id
left join (
  select record_id, count(*) as comment_count from public.comments group by record_id
) cm on cm.record_id = r.id;

-- ----------------------------------------------------------------------------
-- Storage: アバター画像用バケット
-- 誰でも閲覧可能(公開バケット)。アップロード/更新/削除は
-- 自分のユーザーID配下のパス(<uid>/xxx)のみ許可。
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar_images_select_all" on storage.objects;
create policy "avatar_images_select_all"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatar_images_insert_own" on storage.objects;
create policy "avatar_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_images_update_own" on storage.objects;
create policy "avatar_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_images_delete_own" on storage.objects;
create policy "avatar_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
