-- شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
-- يضيف عمود اختياري للاسم الإنجليزي للرواية (يُستخدم في عنوان صفحة البحث بجوجل)
alter table novels add column if not exists title_en text;
