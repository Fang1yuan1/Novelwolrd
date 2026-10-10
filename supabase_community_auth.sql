-- ════════════════════════════════════════════════════════════════
-- ربط «مملكة القراء» بحسابات Supabase Auth + إحصائيات القراءة لصفحة «حسابي»
-- شغّله مرة واحدة بعد supabase_add_community.sql (Supabase → SQL Editor → Run)
-- ════════════════════════════════════════════════════════════════

-- ─── الدوال تعتمد الآن على هوية الحساب المسجَّل (auth.uid()) وتتجاهل المفتاح القادم من المتصفح ───
create or replace function community_register(p_key text, p_name text, p_hue int default 30, p_title text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_key text := auth.uid()::text; v_name text := btrim(coalesce(p_name, ''));
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 24 then raise exception 'bad_name'; end if;
  insert into community_authors(author_key, name, hue, title)
  values (v_key, v_name, coalesce(p_hue, 30) % 360, nullif(left(btrim(coalesce(p_title, '')), 16), ''))
  on conflict (author_key) do update
    set name = excluded.name, hue = excluded.hue, title = excluded.title;
end $$;

create or replace function community_create_post(p_key text, p_novel_id bigint, p_kind text, p_title text, p_body text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_key text := auth.uid()::text;
  v_body text := btrim(coalesce(p_body, ''));
  v_title text := nullif(btrim(coalesce(p_title, '')), '');
  v_id bigint;
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from community_authors where author_key = v_key) then raise exception 'unknown_author'; end if;
  if char_length(v_body) < 2 then raise exception 'body_too_short'; end if;
  if (select count(*) from community_posts where author_key = v_key and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  insert into community_posts(novel_id, author_key, kind, title, body)
  values (p_novel_id, v_key, coalesce(p_kind, 'discussion'), left(v_title, 80), left(v_body, 3000))
  returning id into v_id;
  update community_authors set points = points + 5 where author_key = v_key;
  return v_id;
end $$;

create or replace function community_create_comment(p_key text, p_post_id bigint, p_body text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_key text := auth.uid()::text; v_body text := btrim(coalesce(p_body, '')); v_id bigint;
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from community_authors where author_key = v_key) then raise exception 'unknown_author'; end if;
  if not exists (select 1 from community_posts where id = p_post_id and not is_deleted) then raise exception 'no_post'; end if;
  if char_length(v_body) < 1 then raise exception 'body_too_short'; end if;
  if (select count(*) from community_comments where author_key = v_key and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  insert into community_comments(post_id, author_key, body) values (p_post_id, v_key, left(v_body, 1500)) returning id into v_id;
  update community_posts set comments_count = comments_count + 1, last_activity_at = now() where id = p_post_id;
  update community_authors set points = points + 2 where author_key = v_key;
  return v_id;
end $$;

create or replace function community_toggle_like(p_key text, p_post_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_key text := auth.uid()::text; v_owner text; v_liked boolean; v_count int;
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from community_authors where author_key = v_key) then raise exception 'unknown_author'; end if;
  select author_key into v_owner from community_posts where id = p_post_id and not is_deleted;
  if not found then raise exception 'no_post'; end if;
  if exists (select 1 from community_likes where post_id = p_post_id and author_key = v_key) then
    delete from community_likes where post_id = p_post_id and author_key = v_key;
    update community_posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id returning likes_count into v_count;
    if v_owner <> v_key then update community_authors set points = greatest(points - 1, 0) where author_key = v_owner; end if;
    v_liked := false;
  else
    insert into community_likes(post_id, author_key) values (p_post_id, v_key);
    update community_posts set likes_count = likes_count + 1 where id = p_post_id returning likes_count into v_count;
    if v_owner <> v_key then update community_authors set points = points + 1 where author_key = v_owner; end if;
    v_liked := true;
  end if;
  return jsonb_build_object('liked', v_liked, 'likes', v_count);
end $$;

create or replace function community_my_likes(p_key text, p_ids bigint[])
returns setof bigint language sql security definer set search_path = public as $$
  select post_id from community_likes where author_key = auth.uid()::text and post_id = any(p_ids);
$$;

create or replace function community_delete_own_post(p_key text, p_post_id bigint)
returns void language sql security definer set search_path = public as $$
  update community_posts set is_deleted = true, is_pinned = false where id = p_post_id and author_key = auth.uid()::text;
$$;

create or replace function community_delete_own_comment(p_key text, p_comment_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare v_post bigint;
begin
  update community_comments set is_deleted = true
  where id = p_comment_id and author_key = auth.uid()::text and not is_deleted returning post_id into v_post;
  if v_post is not null then
    update community_posts set comments_count = greatest(comments_count - 1, 0) where id = v_post;
  end if;
end $$;

create or replace function community_check_in(p_key text, p_novel_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_key text := auth.uid()::text; v_rows int;
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from community_authors where author_key = v_key) then raise exception 'unknown_author'; end if;
  insert into community_checkins(novel_id, author_key) values (p_novel_id, v_key) on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then update community_authors set points = points + 1 where author_key = v_key; end if;
  return v_rows > 0;
end $$;

create or replace function community_checked_in(p_key text, p_novel_id bigint)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from community_checkins
    where author_key = auth.uid()::text and novel_id = p_novel_id and day = (now() at time zone 'utc')::date
  );
$$;

-- ─── إحصائيات القراءة (صفحة «حسابي») ───
create table if not exists reading_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id bigint not null references chapters(id) on delete cascade,
  novel_id bigint not null references novels(id) on delete cascade,
  seconds int not null default 0,
  first_read_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);
create index if not exists reading_log_user_idx on reading_log(user_id);

create table if not exists reading_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  primary key (user_id, day)
);

alter table reading_log enable row level security;
alter table reading_days enable row level security;
revoke all on reading_log, reading_days from anon, authenticated;

create or replace function reading_track(p_novel_id bigint, p_chapter_id bigint, p_seconds int default 0)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return; end if;
  insert into reading_log(user_id, chapter_id, novel_id, seconds)
  values (v_uid, p_chapter_id, p_novel_id, least(greatest(coalesce(p_seconds, 0), 0), 60))
  on conflict (user_id, chapter_id) do update
    set seconds = reading_log.seconds + least(greatest(coalesce(p_seconds, 0), 0), 60);
  insert into reading_days(user_id) values (v_uid) on conflict do nothing;
end $$;

create or replace function my_reading_stats()
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'chapters', (select count(*) from reading_log where user_id = auth.uid()),
    'days',     (select count(*) from reading_days where user_id = auth.uid()),
    'hours',    (select round(coalesce(sum(seconds), 0) / 3600.0, 1) from reading_log where user_id = auth.uid()),
    'books',    (select count(distinct novel_id) from reading_log where user_id = auth.uid())
  );
$$;

grant execute on function
  reading_track(bigint, bigint, int),
  my_reading_stats()
to anon, authenticated;
