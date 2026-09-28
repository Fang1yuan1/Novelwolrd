-- شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
-- جدول إعدادات عام للموقع (حاليًا بيخزن إعدادات قسم «الفصل التجريبي»)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
