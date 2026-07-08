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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.records is '1回の実働(遊技)データ。差枚/差玉ではなく投資額・回収額(円)で管理';

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
-- 方針: 閲覧(select)はゲスト(未ログイン/anon)を含め誰でも可能。
--       書き込み(insert/update/delete)は本人(authenticated かつ本人の行)のみ可能。
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.comments enable row level security;

-- profiles
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated, anon
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
drop policy if exists "records_select_authenticated" on public.records;
drop policy if exists "records_select_all" on public.records;
create policy "records_select_all"
  on public.records for select
  to authenticated, anon
  using (true);

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
drop policy if exists "comments_select_authenticated" on public.comments;
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all"
  on public.comments for select
  to authenticated, anon
  using (true);

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

-- ----------------------------------------------------------------------------
-- 便利ビュー: プロフィール情報付きレコード一覧
-- ----------------------------------------------------------------------------
create or replace view public.records_with_profile
with (security_invoker = true) as
select
  r.*,
  (r.payout - r.investment) as diff,
  p.username,
  p.avatar_emoji
from public.records r
join public.profiles p on p.id = r.user_id;
