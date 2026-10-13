-- ════════════════════════════════════════════════════════════════
-- تعليقات الفصول: كل منشور يمكن أن يرتبط برقم فصل (ويظهر رقمه ببطاقة المنشور)
-- شغّله مرة واحدة بعد الملفات السابقة (Supabase → SQL Editor → Run)
-- ════════════════════════════════════════════════════════════════

alter table community_posts add column if not exists chapter_number numeric;
create index if not exists community_posts_chapter_idx on community_posts(novel_id, chapter_number);

-- يضمن وجود أعمدة الملف الشخصي (آمن حتى لو شغّلت الملف السابق)
alter table community_authors add column if not exists avatar_url text
  check (avatar_url is null or char_length(avatar_url) <= 400);
alter table community_authors add column if not exists bio text
  check (bio is null or char_length(bio) <= 120);

-- الـView: عمود رقم الفصل يُضاف بالنهاية
create or replace view community_posts_public as
select p.id, p.novel_id, n.title as novel_title, p.kind, p.title, p.body,
       p.is_pinned, p.is_featured, p.comments_count, p.likes_count,
       p.created_at, p.last_activity_at,
       a.name as author_name, a.hue as author_hue, a.title as author_title, a.points as author_points,
       a.avatar_url as author_avatar,
       p.chapter_number
from community_posts p
join community_authors a on a.author_key = p.author_key
join novels n on n.id = p.novel_id
where not p.is_deleted;

grant select on community_posts_public to anon, authenticated;

-- دالة النشر الجديدة تقبل رقم الفصل (اختياريًا)
drop function if exists community_create_post(text, bigint, text, text, text);

create or replace function community_create_post(
  p_key text, p_novel_id bigint, p_kind text, p_title text, p_body text, p_chapter numeric default null
)
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
  insert into community_posts(novel_id, author_key, kind, title, body, chapter_number)
  values (p_novel_id, v_key, coalesce(p_kind, 'discussion'), left(v_title, 80), left(v_body, 3000), p_chapter)
  returning id into v_id;
  update community_authors set points = points + 5 where author_key = v_key;
  return v_id;
end $$;

grant execute on function community_create_post(text, bigint, text, text, text, numeric) to anon, authenticated;
