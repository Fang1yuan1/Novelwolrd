'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Row = {
  id: number;
  title: string;
  title_en: string | null;
  author: string | null;
  description: string | null;
};

export default function ExportTitlesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError('Supabase غير مهيّأ.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('novels')
        .select('id, title, title_en, author, description')
        .order('id', { ascending: true });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const exportText = useMemo(
    () =>
      rows
        .map((r) => {
          const lines = [`#${r.id} — ${r.title}`];
          if (r.title_en) lines.push(`  الاسم الإنجليزي المحفوظ: ${r.title_en}`);
          if (r.author) lines.push(`  المؤلف: ${r.author}`);
          if (r.description) lines.push(`  الوصف: ${r.description.replace(/\s+/g, ' ').trim()}`);
          return lines.join('\n');
        })
        .join('\n\n'),
    [rows]
  );

  function downloadFile() {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novels-export.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← لوحة التحكم
      </a>
      <h1 className="mb-1 text-xl font-bold">تصدير بيانات كل الروايات</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        كل بيانات رواياتك النصية (العنوان، الاسم الإنجليزي المحفوظ لو فيه، المؤلف، الوصف) بملف نصي
        واحد تقدر تنزّله وتفتحه وترفعه كامل لأي أداة ذكاء اصطناعي — بدون ما تفتح أي رواية لحالها.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-700">
          تعذّر التحميل: {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">جارٍ التحميل…</p>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] text-ink-500">{rows.length} رواية</span>
            <button
              type="button"
              onClick={downloadFile}
              className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              تحميل ملف واحد (novels-export.txt)
            </button>
          </div>
          <textarea
            readOnly
            value={exportText}
            dir="auto"
            className="h-[60vh] w-full rounded border border-ink-300/40 p-3 font-mono text-[12.5px] leading-6 outline-none"
          />
        </>
      )}
    </div>
  );
}
