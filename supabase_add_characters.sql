-- شغّل الأمر ده مرة واحدة بس في Supabase → SQL Editor
create table if not exists characters (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  novel_id bigint not null references novels(id) on delete cascade,
  name text not null,
  role text,             -- مثال: "البطل"، "الشخصية المساعدة"
  avatar_url text,
  description text,
  likes bigint not null default 0,
  sort_order integer not null default 0
);

create index if not exists characters_novel_id_idx on characters(novel_id);
