-- اختياري — شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
-- الهدف: عمود يحسب عدد أحرف كل فصل تلقائيًا، عشان صفحة الفهرس (عدد الأحرف بجنب كل فصل)
-- ما تحتاجش تجيب نص كل الفصول من قاعدة البيانات في كل زيارة.
-- لو ما شغّلتوش الموقع بيشتغل عادي، بس صفحة الفهرس هتكون أبطأ في الروايات اللي فيها فصول كتير.

alter table chapters
  add column if not exists word_count integer
  generated always as (char_length(content)) stored;
