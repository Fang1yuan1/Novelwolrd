-- شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
-- الهدف: إضافة عمودين لجدول novels يخزّنوا عدد الفصول وإجمالي عدد الأحرف
-- بدل ما الموقع يجيب كل نص كل فصل في كل رواية عشان يحسبهم في كل صفحة (ده كان سبب البطء الرئيسي)

alter table novels
  add column if not exists chapter_count integer not null default 0,
  add column if not exists word_count bigint not null default 0;

-- تعبئة القيم الحالية لكل الروايات الموجودة فعلاً
update novels n
set chapter_count = c.cnt,
    word_count = c.words
from (
  select novel_id, count(*) as cnt, coalesce(sum(length(content)), 0) as words
  from chapters
  group by novel_id
) c
where c.novel_id = n.id;

-- دالة تحدّث عمودي الرواية تلقائيًا عند إضافة/تعديل/حذف أي فصل
create or replace function update_novel_stats() returns trigger as $$
declare
  target_id bigint;
begin
  target_id := coalesce(new.novel_id, old.novel_id);
  update novels
  set chapter_count = (select count(*) from chapters where novel_id = target_id),
      word_count = (select coalesce(sum(length(content)), 0) from chapters where novel_id = target_id)
  where id = target_id;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_update_novel_stats on chapters;
create trigger trg_update_novel_stats
after insert or update or delete on chapters
for each row execute function update_novel_stats();
