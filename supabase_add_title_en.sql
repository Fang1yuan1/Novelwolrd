-- الاسم الإنجليزي للرواية: يُستخدم بالبحث داخل الموقع ويظهر بعنوان الصفحة لجوجل (لا يظهر للقرّاء بالصفحة نفسها)
alter table novels add column if not exists title_en text;
