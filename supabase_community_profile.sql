-- ════════════════════════════════════════════════════════════════
-- الملف الشخصي: صورة + نبذة (تظهر مع منشورات المملكة) + مخزن الصور
-- شغّله مرة واحدة بعد الملفين السابقين (Supabase → SQL Editor → Run)
-- ════════════════════════════════════════════════════════════════

alter table community_authors add column if not exists avatar_url text
  check (avatar_url is null or char_length(avatar_url) <= 400);
alter table community_authors add column if not exists bio text
  check (bio is null or char_length(bio) <= 120);

-- الـViews: العمود الجديد يُضاف بالنهاية
create or replace view community_posts_public as
select p.id, p.novel_id, n.title as novel_title, p.kind, p.title, p.body,
       p.is_pinned, p.is_featured, p.comments_count, p.likes_count,
       p.created_at, p.last_activity_at,
       a.name as author_name, a.hue as author_hue, a.title as author_title, a.points as author_points,
       a.avatar_url as author_avatar
from community_posts p
join community_authors a on a.author_key = p.author_key
join novels n on n.id = p.novel_id
where not p.is_deleted;

create or replace view community_comments_public as
select c.id, c.post_id, c.body, c.created_at,
       a.name as author_name, a.hue as author_hue, a.title as author_title, a.points as author_points,
       a.avatar_url as author_avatar
from community_comments c
join community_authors a on a.author_key = c.author_key
where not c.is_deleted;

grant select on community_posts_public, community_comments_public to anon, authenticated;

-- تحديث ملف القارئ (يعمل إن كان له سجل بالمملكة؛ وإلا يُنشأ سجله بأول مشاركة)
create or replace function community_set_profile(p_name text, p_avatar_url text, p_bio text)
returns void language plpgsql security definer set search_path = public as $$
declare v_key text := auth.uid()::text; v_name text := btrim(coalesce(p_name, ''));
begin
  if v_key is null then raise exception 'not_authenticated'; end if;
  update community_authors
     set name = case when char_length(v_name) between 2 and 24 then v_name else name end,
         avatar_url = nullif(left(btrim(coalesce(p_avatar_url, '')), 400), ''),
         bio = nullif(left(btrim(coalesce(p_bio, '')), 120), '')
   where author_key = v_key;
end $$;

grant execute on function community_set_profile(text, text, text) to anon, authenticated;

-- مخزن صور الحسابات (عام للقراءة، وكل قارئ يكتب بمجلده فقط)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 524288, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars own insert" on storage.objects;
drop policy if exists "avatars own update" on storage.objects;
drop policy if exists "avatars own delete" on storage.objects;

create policy "avatars public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
