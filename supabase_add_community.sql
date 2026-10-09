-- ════════════════════════════════════════════════════════════════
-- نظام «مملكة القراء» (منشورات + تعليقات + إعجابات + حضور)
-- شغّل الملف كله مرة واحدة بس في Supabase → SQL Editor → Run
-- بآخر النتيجة بيظهر لك «كلمة سر الإشراف» (احفظها، بتحتاجها بـ /admin/community)
-- ════════════════════════════════════════════════════════════════

-- ─── الجداول ───────────────────────────────────────────────────
create table if not exists community_authors (
  author_key text primary key,                       -- مفتاح سرّي عشوائي مخزّن بمتصفح القارئ (ما يظهر لأي أحد)
  name text not null check (char_length(name) between 2 and 24),
  hue int not null default 30,                       -- لون الصورة الرمزية
  title text check (title is null or char_length(title) <= 16),  -- لقب مخصص (شارة برتقالية)
  points int not null default 0,                     -- نقاط النشاط (تحدد المستوى)
  created_at timestamptz not null default now()
);

create table if not exists community_posts (
  id bigint generated always as identity primary key,
  novel_id bigint not null references novels(id) on delete cascade,
  author_key text not null references community_authors(author_key) on delete cascade,
  kind text not null default 'discussion'
    check (kind in ('discussion','review','merch','share','fanwork','other')),
  title text check (title is null or char_length(title) <= 80),
  body text not null check (char_length(body) between 2 and 3000),
  is_pinned boolean not null default false,
  is_featured boolean not null default false,
  is_deleted boolean not null default false,
  comments_count int not null default 0,
  likes_count int not null default 0,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);
create index if not exists community_posts_novel_activity_idx on community_posts(novel_id, last_activity_at desc);
create index if not exists community_posts_novel_created_idx on community_posts(novel_id, created_at desc);
create index if not exists community_posts_novel_likes_idx on community_posts(novel_id, likes_count desc);
create index if not exists community_posts_author_idx on community_posts(author_key, created_at desc);

create table if not exists community_comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references community_posts(id) on delete cascade,
  author_key text not null references community_authors(author_key) on delete cascade,
  body text not null check (char_length(body) between 1 and 1500),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists community_comments_post_idx on community_comments(post_id, created_at);

create table if not exists community_likes (
  post_id bigint not null references community_posts(id) on delete cascade,
  author_key text not null references community_authors(author_key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, author_key)
);

create table if not exists community_checkins (
  novel_id bigint not null references novels(id) on delete cascade,
  author_key text not null references community_authors(author_key) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  primary key (novel_id, author_key, day)
);

create table if not exists community_admin_secret (
  secret text not null
);

-- ─── الأمان: ممنوع أي وصول مباشر للجداول (القراءة عبر الـViews والكتابة عبر الدوال فقط) ───
alter table community_authors enable row level security;
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table community_likes enable row level security;
alter table community_checkins enable row level security;
alter table community_admin_secret enable row level security;

revoke all on community_authors, community_posts, community_comments,
  community_likes, community_checkins, community_admin_secret from anon, authenticated;

-- ─── Views عامة (بدون مفتاح الكاتب السرّي) ─────────────────────────
create or replace view community_posts_public as
select p.id, p.novel_id, n.title as novel_title, p.kind, p.title, p.body,
       p.is_pinned, p.is_featured, p.comments_count, p.likes_count,
       p.created_at, p.last_activity_at,
       a.name as author_name, a.hue as author_hue, a.title as author_title, a.points as author_points
from community_posts p
join community_authors a on a.author_key = p.author_key
join novels n on n.id = p.novel_id
where not p.is_deleted;

create or replace view community_comments_public as
select c.id, c.post_id, c.body, c.created_at,
       a.name as author_name, a.hue as author_hue, a.title as author_title, a.points as author_points
from community_comments c
join community_authors a on a.author_key = c.author_key
where not c.is_deleted;

grant select on community_posts_public, community_comments_public to anon, authenticated;

-- ─── الدوال (الكتابة) ──────────────────────────────────────────────
create or replace function community_register(p_key text, p_name text, p_hue int default 30, p_title text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_name text := btrim(coalesce(p_name, ''));
begin
  if p_key is null or char_length(p_key) < 16 or char_length(p_key) > 64 then raise exception 'bad_key'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 24 then raise exception 'bad_name'; end if;
  insert into community_authors(author_key, name, hue, title)
  values (p_key, v_name, coalesce(p_hue, 30) % 360, nullif(left(btrim(coalesce(p_title, '')), 16), ''))
  on conflict (author_key) do update
    set name = excluded.name, hue = excluded.hue, title = excluded.title;
end $$;

create or replace function community_create_post(p_key text, p_novel_id bigint, p_kind text, p_title text, p_body text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_title text := nullif(btrim(coalesce(p_title, '')), '');
  v_id bigint;
begin
  if not exists (select 1 from community_authors where author_key = p_key) then raise exception 'unknown_author'; end if;
  if char_length(v_body) < 2 then raise exception 'body_too_short'; end if;
  if (select count(*) from community_posts where author_key = p_key and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  insert into community_posts(novel_id, author_key, kind, title, body)
  values (p_novel_id, p_key, coalesce(p_kind, 'discussion'), left(v_title, 80), left(v_body, 3000))
  returning id into v_id;
  update community_authors set points = points + 5 where author_key = p_key;
  return v_id;
end $$;

create or replace function community_create_comment(p_key text, p_post_id bigint, p_body text)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_body text := btrim(coalesce(p_body, '')); v_id bigint;
begin
  if not exists (select 1 from community_authors where author_key = p_key) then raise exception 'unknown_author'; end if;
  if not exists (select 1 from community_posts where id = p_post_id and not is_deleted) then raise exception 'no_post'; end if;
  if char_length(v_body) < 1 then raise exception 'body_too_short'; end if;
  if (select count(*) from community_comments where author_key = p_key and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  insert into community_comments(post_id, author_key, body) values (p_post_id, p_key, left(v_body, 1500)) returning id into v_id;
  update community_posts set comments_count = comments_count + 1, last_activity_at = now() where id = p_post_id;
  update community_authors set points = points + 2 where author_key = p_key;
  return v_id;
end $$;

create or replace function community_toggle_like(p_key text, p_post_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_owner text; v_liked boolean; v_count int;
begin
  if not exists (select 1 from community_authors where author_key = p_key) then raise exception 'unknown_author'; end if;
  select author_key into v_owner from community_posts where id = p_post_id and not is_deleted;
  if not found then raise exception 'no_post'; end if;
  if exists (select 1 from community_likes where post_id = p_post_id and author_key = p_key) then
    delete from community_likes where post_id = p_post_id and author_key = p_key;
    update community_posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id returning likes_count into v_count;
    if v_owner <> p_key then update community_authors set points = greatest(points - 1, 0) where author_key = v_owner; end if;
    v_liked := false;
  else
    insert into community_likes(post_id, author_key) values (p_post_id, p_key);
    update community_posts set likes_count = likes_count + 1 where id = p_post_id returning likes_count into v_count;
    if v_owner <> p_key then update community_authors set points = points + 1 where author_key = v_owner; end if;
    v_liked := true;
  end if;
  return jsonb_build_object('liked', v_liked, 'likes', v_count);
end $$;

create or replace function community_my_likes(p_key text, p_ids bigint[])
returns setof bigint language sql security definer set search_path = public as $$
  select post_id from community_likes where author_key = p_key and post_id = any(p_ids);
$$;

create or replace function community_delete_own_post(p_key text, p_post_id bigint)
returns void language sql security definer set search_path = public as $$
  update community_posts set is_deleted = true, is_pinned = false where id = p_post_id and author_key = p_key;
$$;

create or replace function community_delete_own_comment(p_key text, p_comment_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare v_post bigint;
begin
  update community_comments set is_deleted = true
  where id = p_comment_id and author_key = p_key and not is_deleted returning post_id into v_post;
  if v_post is not null then
    update community_posts set comments_count = greatest(comments_count - 1, 0) where id = v_post;
  end if;
end $$;

create or replace function community_check_in(p_key text, p_novel_id bigint)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_rows int;
begin
  if not exists (select 1 from community_authors where author_key = p_key) then raise exception 'unknown_author'; end if;
  insert into community_checkins(novel_id, author_key) values (p_novel_id, p_key) on conflict do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then update community_authors set points = points + 1 where author_key = p_key; end if;
  return v_rows > 0;
end $$;

create or replace function community_checked_in(p_key text, p_novel_id bigint)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from community_checkins
    where author_key = p_key and novel_id = p_novel_id and day = (now() at time zone 'utc')::date
  );
$$;

-- إحصائيات المملكة: عدد المنشورات + عدد الأعضاء (كل من نشر أو علّق أو سجّل حضورًا). بدون رقم رواية = كل الممالك
create or replace function community_stats(p_novel_id bigint default null)
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'posts', (select count(*) from community_posts p where not p.is_deleted and (p_novel_id is null or p.novel_id = p_novel_id)),
    'members', (
      select count(*) from (
        select p.author_key from community_posts p where not p.is_deleted and (p_novel_id is null or p.novel_id = p_novel_id)
        union
        select c.author_key from community_comments c join community_posts p on p.id = c.post_id
          where not c.is_deleted and (p_novel_id is null or p.novel_id = p_novel_id)
        union
        select k.author_key from community_checkins k where (p_novel_id is null or k.novel_id = p_novel_id)
      ) m
    )
  );
$$;

-- ─── الإشراف (تثبيت/تمييز/حذف) — محمي بكلمة سر الإشراف ──────────────────
create or replace function community_admin_action(p_secret text, p_kind text, p_id bigint, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare v_post bigint;
begin
  if not exists (select 1 from community_admin_secret where secret = p_secret) then raise exception 'forbidden'; end if;
  if p_kind = 'post' then
    if p_action = 'pin' then update community_posts set is_pinned = true where id = p_id;
    elsif p_action = 'unpin' then update community_posts set is_pinned = false where id = p_id;
    elsif p_action = 'feature' then update community_posts set is_featured = true where id = p_id;
    elsif p_action = 'unfeature' then update community_posts set is_featured = false where id = p_id;
    elsif p_action = 'delete' then update community_posts set is_deleted = true, is_pinned = false where id = p_id;
    else raise exception 'bad_action'; end if;
  elsif p_kind = 'comment' and p_action = 'delete' then
    update community_comments set is_deleted = true where id = p_id and not is_deleted returning post_id into v_post;
    if v_post is not null then
      update community_posts set comments_count = greatest(comments_count - 1, 0) where id = v_post;
    end if;
  else
    raise exception 'bad_action';
  end if;
end $$;

create or replace function community_admin_check(p_secret text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from community_admin_secret where secret = p_secret);
$$;

grant execute on function
  community_register(text, text, int, text),
  community_create_post(text, bigint, text, text, text),
  community_create_comment(text, bigint, text),
  community_toggle_like(text, bigint),
  community_my_likes(text, bigint[]),
  community_delete_own_post(text, bigint),
  community_delete_own_comment(text, bigint),
  community_check_in(text, bigint),
  community_checked_in(text, bigint),
  community_stats(bigint),
  community_admin_action(text, text, bigint, text),
  community_admin_check(text)
to anon, authenticated;

-- ─── كلمة سر الإشراف: تتولّد عشوائيًا مرة واحدة وتظهر لك بالنتيجة ───────────
insert into community_admin_secret(secret)
select replace(gen_random_uuid()::text, '-', '')
where not exists (select 1 from community_admin_secret);

select secret as "كلمة سر الإشراف (احفظها)" from community_admin_secret;
