-- شغّل هذا الملف كاملًا مرة واحدة في Supabase → SQL Editor
-- الهدف: إصلاح خطأ "canceling statement due to statement timeout" عند رفع فصول كثيرة

-- 1) استبدال التريجر القديم (كان يعيد حساب كل فصول الرواية مع كل فصل مرفوع = بطيء جدًا)
--    بتريجرات خفيفة تحدّث العدّاد مرة واحدة لكل عملية رفع بشكل تراكمي.
drop trigger if exists trg_update_novel_stats on chapters;
drop trigger if exists trg_novel_stats_ins on chapters;
drop trigger if exists trg_novel_stats_upd on chapters;
drop trigger if exists trg_novel_stats_del on chapters;

create or replace function novel_stats_after_insert() returns trigger as $$
begin
  update novels n
  set chapter_count = n.chapter_count + d.cnt,
      word_count = n.word_count + d.words
  from (select novel_id, count(*) as cnt, coalesce(sum(char_length(content)), 0) as words
        from new_rows group by novel_id) d
  where n.id = d.novel_id;
  return null;
end;
$$ language plpgsql;

create or replace function novel_stats_after_update() returns trigger as $$
begin
  update novels n
  set word_count = n.word_count + d.diff
  from (
    select novel_id, sum(w) as diff from (
      select novel_id, char_length(content) as w from new_rows
      union all
      select novel_id, -char_length(content) as w from old_rows
    ) x group by novel_id
  ) d
  where n.id = d.novel_id;
  return null;
end;
$$ language plpgsql;

create or replace function novel_stats_after_delete() returns trigger as $$
begin
  update novels n
  set chapter_count = greatest(n.chapter_count - d.cnt, 0),
      word_count = greatest(n.word_count - d.words, 0)
  from (select novel_id, count(*) as cnt, coalesce(sum(char_length(content)), 0) as words
        from old_rows group by novel_id) d
  where n.id = d.novel_id;
  return null;
end;
$$ language plpgsql;

create trigger trg_novel_stats_ins after insert on chapters
  referencing new table as new_rows for each statement
  execute function novel_stats_after_insert();

create trigger trg_novel_stats_upd after update on chapters
  referencing new table as new_rows old table as old_rows for each statement
  execute function novel_stats_after_update();

create trigger trg_novel_stats_del after delete on chapters
  referencing old table as old_rows for each statement
  execute function novel_stats_after_delete();

-- 2) فهرس يسرّع الـupsert (لو موجود مسبقًا ما يضر)
create unique index if not exists chapters_novel_id_chapter_number_key
  on chapters (novel_id, chapter_number);

-- 3) رفع مهلة الاستعلام لمفتاح الأدمن (anon افتراضيًا ~3 ثواني فقط)
alter role anon set statement_timeout = '60s';
notify pgrst, 'reload config';

-- 4) إعادة ضبط العدّادات مرة واحدة (آمن، يصحّح أي فرق)
update novels n
set chapter_count = coalesce(c.cnt, 0), word_count = coalesce(c.words, 0)
from (select novel_id, count(*) as cnt, sum(char_length(content)) as words
      from chapters group by novel_id) c
where c.novel_id = n.id;
