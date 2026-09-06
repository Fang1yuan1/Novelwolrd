-- شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
alter table categories
  add column if not exists cover_novel_id bigint references novels(id) on delete set null;
