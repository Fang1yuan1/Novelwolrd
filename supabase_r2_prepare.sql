-- ════════════════════════════════════════════════════════════════
-- تحضير قاعدة البيانات لنقل نصوص الفصول إلى R2 — شغّله مرة واحدة قبل أي نقل
-- (يحمي عدّاد الأحرف من التصفير عند تفريغ عمود content بعد النقل)
-- ════════════════════════════════════════════════════════════════

-- 1) عمود عدد الأحرف يتحول من «محسوب تلقائيًا من النص» إلى عمود عادي يحتفظ بقيمه الحالية
alter table chapters add column if not exists word_count integer;

do $$
begin
  if exists (
    select 1 from pg_attribute
    where attrelid = 'chapters'::regclass and attname = 'word_count' and attgenerated <> ''
  ) then
    alter table chapters alter column word_count drop expression;
  end if;
end $$;

update chapters set word_count = char_length(content) where word_count is null and char_length(content) > 0;

-- 2) أي فصل جديد أو معدّل بنص يُحدَّث عدّاد أحرفه تلقائيًا؛ وعند تفريغ النص لا يتغير
create or replace function chapters_set_word_count() returns trigger language plpgsql as $$
begin
  if new.content is not null and char_length(new.content) > 0 then
    new.word_count := char_length(new.content);
  end if;
  return new;
end $$;

drop trigger if exists trg_chapters_word_count on chapters;
create trigger trg_chapters_word_count
  before insert or update of content on chapters
  for each row execute function chapters_set_word_count();

-- 3) إحصاء الرواية (word_count) لا ينقص عند تفريغ النص بعد النقل
create or replace function novel_stats_upd_stmt() returns trigger language plpgsql as $$
begin
  update novels t
  set word_count = greatest(t.word_count + k.delta, 0)
  from (
    select n.novel_id, sum(length(n.content) - length(o.content)) as delta
    from new_rows n join old_rows o on o.id = n.id
    where length(n.content) > 0 and length(o.content) > 0
    group by n.novel_id
  ) k
  where t.id = k.novel_id;
  return null;
end $$;

-- تحقق: يجب أن يظهر العمود word_count بدون is_generated = ALWAYS
select column_name, is_generated, generation_expression
from information_schema.columns
where table_name = 'chapters' and column_name = 'word_count';
