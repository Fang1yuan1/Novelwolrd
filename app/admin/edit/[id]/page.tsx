'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COVER_BUCKET = 'covers';

type Novel = {
  id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  author: string | null;
  status: string | null;
  tags: string | null;
};

type ChapterRow = {
  id: number;
  chapter_number: number;
  title: string | null;
  volume: string | null;
  content: string;
};

export default function EditNovelPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { ok: true } | { ok: false; message: string } | null
  >(null);

  // إدارة الفصول
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [newChapterNumber, setNewChapterNumber] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterVolume, setNewChapterVolume] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterResult, setChapterResult] = useState<
    { ok: true } | { ok: false; message: string } | null
  >(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  // حذف الرواية
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function loadChapters() {
    if (!id) return;
    setLoadingChapters(true);
    const { data } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, volume, content')
      .eq('novel_id', id)
      .order('chapter_number', { ascending: true });
    setChapters((data as ChapterRow[]) || []);
    setLoadingChapters(false);
  }

  useEffect(() => {
    loadChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    setChapterResult(null);

    const num = Number(newChapterNumber);
    if (!num || num < 1) {
      setChapterResult({ ok: false, message: 'رقم الفصل مطلوب ويجب أن يكون رقمًا صحيحًا.' });
      return;
    }
    if (!newChapterContent.trim()) {
      setChapterResult({ ok: false, message: 'محتوى الفصل مطلوب.' });
      return;
    }

    setAddingChapter(true);
    const { error } = await supabase.from('chapters').insert({
      novel_id: Number(id),
      chapter_number: num,
      title: newChapterTitle.trim() || null,
      volume: newChapterVolume.trim() || null,
      content: newChapterContent,
    });
    setAddingChapter(false);

    if (error) {
      setChapterResult({ ok: false, message: error.message });
      return;
    }

    setNewChapterNumber('');
    setNewChapterTitle('');
    setNewChapterVolume('');
    setNewChapterContent('');
    setChapterResult({ ok: true });
    loadChapters();
  }

  async function handleDeleteChapter(chapterId: number, chapterNumber: number) {
    if (!confirm(`متأكد إنك عايز تحذف الفصل ${chapterNumber}؟ الإجراء ده لا يمكن التراجع عنه.`)) {
      return;
    }
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
    if (error) {
      alert(`فشل الحذف: ${error.message}`);
      return;
    }
    loadChapters();
  }

  async function handleDeleteAllChapters() {
    if (chapters.length === 0) return;
    if (
      !confirm(
        `متأكد إنك عايز تحذف كل الفصول (${chapters.length} فصل) لهذه الرواية؟ الإجراء ده لا يمكن التراجع عنه.`
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    const { error } = await supabase.from('chapters').delete().eq('novel_id', id);
    setBulkDeleting(false);
    if (error) {
      alert(`فشل الحذف: ${error.message}`);
      return;
    }
    loadChapters();
  }

  async function handleDeleteRange(e: React.FormEvent) {
    e.preventDefault();
    const from = Number(rangeFrom);
    const to = Number(rangeTo);
    if (!from || !to || from > to) {
      alert('أدخل نطاق فصول صحيح (من رقم أصغر أو يساوي إلى رقم أكبر).');
      return;
    }
    if (
      !confirm(`متأكد إنك عايز تحذف الفصول من ${from} إلى ${to}؟ الإجراء ده لا يمكن التراجع عنه.`)
    ) {
      return;
    }
    setBulkDeleting(true);
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('novel_id', id)
      .gte('chapter_number', from)
      .lte('chapter_number', to);
    setBulkDeleting(false);
    if (error) {
      alert(`فشل الحذف: ${error.message}`);
      return;
    }
    setRangeFrom('');
    setRangeTo('');
    loadChapters();
  }

  async function handleDeleteNovel() {
    setDeleteError('');
    if (deleteConfirmText.trim() !== title.trim()) {
      setDeleteError('اكتب عنوان الرواية بالظبط للتأكيد.');
      return;
    }
    setDeleting(true);

    const { error: chaptersError } = await supabase
      .from('chapters')
      .delete()
      .eq('novel_id', id);
    if (chaptersError) {
      setDeleting(false);
      setDeleteError(`فشل حذف فصول الرواية: ${chaptersError.message}`);
      return;
    }

    const { error: novelError, data } = await supabase
      .from('novels')
      .delete()
      .eq('id', id)
      .select();
    setDeleting(false);

    if (novelError) {
      setDeleteError(`فشل حذف الرواية: ${novelError.message}`);
      return;
    }
    if (!data || data.length === 0) {
      setDeleteError(
        'الحذف لم يتم فعليًا — على الأرجح صلاحيات (RLS) في جدول novels لا تسمح بالحذف. تأكد من وجود سياسة DELETE على الجدول.'
      );
      return;
    }

    window.location.href = '/admin/edit';
  }

  useEffect(() => {
    async function load() {
      if (!id) return;

      const { data: novel, error } = await supabase
        .from('novels')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !novel) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const n = novel as Novel;
      setTitle(n.title || '');
      setAuthor(n.author || '');
      setDescription(n.description || '');
      setStatus((n.status as 'ongoing' | 'completed') || 'ongoing');
      setTags(n.tags || '');
      setCoverUrl(n.cover_url || '');
      setCoverPreview(n.cover_url || '');
      setSelectedCategories(
        (n.category || '').split(',').map((c) => c.trim()).filter(Boolean)
      );

      // تحميل كل التصنيفات المتاحة (الرسمية + أي تصنيفات قديمة مكتوبة يدوي)
      const { data: catRows } = await supabase.from('categories').select('name').order('name');
      const official = (catRows || []).map((r: any) => r.name as string);
      const { data: novelRows } = await supabase
        .from('novels')
        .select('category')
        .not('category', 'is', null);
      const legacy = (novelRows || []).flatMap((r: any) =>
        ((r.category as string) || '').split(',').map((c) => c.trim())
      );
      setAllCategories(Array.from(new Set([...official, ...legacy].filter(Boolean))).sort());

      setLoading(false);
    }
    load();
  }, [id]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function addNewCategory() {
    const c = newCategory.trim();
    if (!c) return;
    if (!allCategories.includes(c)) setAllCategories((prev) => [...prev, c].sort());
    if (!selectedCategories.includes(c)) setSelectedCategories((prev) => [...prev, c]);
    setNewCategory('');
  }

  function handleCoverFileChange(file: File | null) {
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview(coverUrl);
  }

  async function handleCoverUpload(file: File): Promise<string | null> {
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(COVER_BUCKET)
        .upload(path, file);
      if (uploadError) {
        setResult({
          ok: false,
          message: `فشل رفع الغلاف: ${uploadError.message} — تأكد إن Bucket اسمه "${COVER_BUCKET}" موجود وPublic في Supabase Storage`,
        });
        return null;
      }
      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!title.trim()) {
      setResult({ ok: false, message: 'العنوان مطلوب.' });
      return;
    }

    setSubmitting(true);

    let finalCoverUrl = coverUrl.trim();
    if (coverFile) {
      const uploaded = await handleCoverUpload(coverFile);
      if (uploaded) finalCoverUrl = uploaded;
      else {
        setSubmitting(false);
        return;
      }
    }

    const { data: updatedRows, error } = await supabase
      .from('novels')
      .update({
        title: title.trim(),
        description: description.trim() || null,
        cover_url: finalCoverUrl || null,
        category: selectedCategories.join(',') || null,
        author: author.trim() || null,
        status,
        tags: tags.trim() || null,
      })
      .eq('id', id)
      .select();

    setSubmitting(false);

    if (error) {
      setResult({ ok: false, message: error.message });
      return;
    }

    if (!updatedRows || updatedRows.length === 0) {
      setResult({
        ok: false,
        message:
          'الحفظ لم يتم فعليًا — على الأرجح صلاحيات (RLS) في جدول novels لا تسمح بالتعديل. تأكد من وجود سياسة UPDATE على الجدول.',
      });
      return;
    }

    setCoverUrl(finalCoverUrl);
    setCoverFile(null);
    setResult({ ok: true });
  }

  if (loading) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
        <p className="text-[13px] text-ink-300">جارٍ التحميل…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
        <p className="text-[13px] text-red-600">لم يتم العثور على رواية بهذا الرقم.</p>
        <a href="/admin/edit" className="mt-2 inline-block text-[13px] text-brand hover:underline">
          ← الرجوع لقائمة الروايات
        </a>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <div className="mb-4 flex flex-wrap gap-3 text-[13px] text-ink-500">
        <a href="/admin" className="hover:text-brand">← لوحة التحكم</a>
        <a href="/admin/edit" className="hover:text-brand">← كل الروايات</a>
        <a href={`/novel/${id}`} className="hover:text-brand">عرض صفحة الرواية</a>
      </div>

      <h1 className="mb-6 text-xl font-bold">تعديل: {title}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="العنوان *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </Field>

        <Field label="المؤلف">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </Field>

        <Field label="التصنيفات (تقدر تختار أكتر من واحد)">
          <div className="flex flex-wrap gap-2 rounded border border-ink-300/40 p-2">
            {allCategories.length === 0 && (
              <span className="text-[12px] text-ink-300">لا توجد تصنيفات بعد — أضف واحد تحت</span>
            )}
            {allCategories.map((c) => {
              const checked = selectedCategories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full border px-3 py-1 text-[12px] ${
                    checked
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-ink-300/40 text-ink-700 hover:border-brand hover:text-brand'
                  }`}
                >
                  {checked ? '✓ ' : ''}
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewCategory();
                }
              }}
              className="flex-1 rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="اكتب اسم تصنيف جديد ثم اضغط Enter أو الزر"
            />
            <button
              type="button"
              onClick={addNewCategory}
              className="rounded border border-ink-300/40 px-3 py-2 text-[12px] font-medium text-ink-700 hover:border-brand hover:text-brand"
            >
              + إضافة
            </button>
          </div>

          {selectedCategories.length > 0 && (
            <p className="mt-1 text-[11px] text-ink-500">
              المختار: {selectedCategories.join('، ')}
            </p>
          )}
        </Field>

        <Field label="الحالة">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed')}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="ongoing">مستمرة</option>
            <option value="completed">مكتملة</option>
          </select>
        </Field>

        <Field label="وسوم (مفصولة بفاصلة)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="مثال: VIP, روايات خفيفة, خيال أصلي"
          />
        </Field>

        <Field label="النبذة">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </Field>

        <Field label="غلاف الرواية">
          <div className="flex flex-col gap-2">
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="معاينة الغلاف"
                className="h-40 w-28 rounded object-cover"
              />
            )}
            <input
              value={coverUrl}
              onChange={(e) => {
                setCoverUrl(e.target.value);
                if (!coverFile) setCoverPreview(e.target.value);
              }}
              disabled={!!coverFile}
              className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand disabled:bg-surface disabled:text-ink-300"
              placeholder="رابط صورة الغلاف"
            />
            <div className="flex items-center gap-2 text-[12px] text-ink-500">
              <span>أو ارفع صورة جديدة تستبدل الحالية:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverFileChange(e.target.files?.[0] || null)}
              />
              {coverFile && (
                <button
                  type="button"
                  onClick={() => handleCoverFileChange(null)}
                  className="text-red-600 hover:underline"
                >
                  إلغاء
                </button>
              )}
            </div>
            <p className="text-[11px] text-ink-300">
              الرفع المباشر يحتاج Bucket اسمه &quot;{COVER_BUCKET}&quot; في Supabase Storage (خليه Public).
            </p>
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting || uploadingCover}
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting || uploadingCover ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
        </button>

        {result && result.ok && (
          <div className="rounded border border-green-300 bg-green-50 p-3 text-[13px] text-green-800">
            ✅ تم حفظ التعديلات بنجاح.{' '}
            <a href={`/novel/${id}`} className="underline">عرض الصفحة</a>
          </div>
        )}
        {result && !result.ok && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">
            ❌ {result.message}
          </div>
        )}
      </form>

      {/* إدارة الفصول */}
      <div className="mt-10 border-t border-ink-300/20 pt-6">
        <h2 className="mb-1 text-lg font-bold">الفصول ({chapters.length})</h2>
        <p className="mb-4 text-[13px] text-ink-500">
          لرفع دفعة فصول دفعة واحدة عبر ملف JSON، استخدم{' '}
          <a href="/admin/upload" className="text-brand hover:underline">صفحة رفع الفصول</a>.
        </p>

        {loadingChapters ? (
          <p className="text-[13px] text-ink-300">جارٍ تحميل الفصول…</p>
        ) : chapters.length === 0 ? (
          <p className="mb-4 text-[13px] text-ink-300">لا توجد فصول مضافة لهذه الرواية بعد.</p>
        ) : (
          <>
            {/* حذف بالجملة */}
            <div className="mb-3 flex flex-col gap-2 rounded border border-red-200 bg-red-50/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <form onSubmit={handleDeleteRange} className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-ink-700">حذف نطاق: من</span>
                <input
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  type="number"
                  min={1}
                  placeholder="1"
                  className="w-16 rounded border border-ink-300/40 px-2 py-1 text-[12px] outline-none focus:border-red-400"
                />
                <span className="text-[12px] text-ink-700">إلى</span>
                <input
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  type="number"
                  min={1}
                  placeholder="10"
                  className="w-16 rounded border border-ink-300/40 px-2 py-1 text-[12px] outline-none focus:border-red-400"
                />
                <button
                  type="submit"
                  disabled={bulkDeleting}
                  className="rounded bg-red-600 px-3 py-1 text-[12px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  حذف النطاق
                </button>
              </form>
              <button
                type="button"
                onClick={handleDeleteAllChapters}
                disabled={bulkDeleting}
                className="rounded border border-red-600 px-3 py-1.5 text-[12px] font-medium text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-50"
              >
                {bulkDeleting ? 'جارٍ الحذف…' : `🗑 حذف كل الفصول (${chapters.length})`}
              </button>
            </div>

            <ul className="mb-4 flex max-h-80 flex-col gap-1 overflow-y-auto rounded border border-ink-300/20 p-2">
            {chapters.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-[13px] hover:bg-surface"
              >
                <span className="min-w-0 truncate">
                  الفصل {c.chapter_number}
                  {c.title ? ` — ${c.title}` : ''}
                  <span className="text-[11px] text-ink-300"> ({c.content.length.toLocaleString('ar-EG')} حرف)</span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <a
                    href={`/novel/${id}/chapter/${c.chapter_number}`}
                    className="text-[12px] text-ink-500 hover:text-brand"
                  >
                    عرض
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteChapter(c.id, c.chapter_number)}
                    className="text-[12px] text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </span>
              </li>
            ))}
          </ul>
          </>
        )}

        <form onSubmit={handleAddChapter} className="flex flex-col gap-3 rounded border border-ink-300/20 p-3">
          <h3 className="text-sm font-semibold">إضافة فصل جديد</h3>
          <div className="flex gap-3">
            <Field label="رقم الفصل *">
              <input
                value={newChapterNumber}
                onChange={(e) => setNewChapterNumber(e.target.value)}
                type="number"
                min={1}
                className="w-24 rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </Field>
            <Field label="المجلد (اختياري)">
              <input
                value={newChapterVolume}
                onChange={(e) => setNewChapterVolume(e.target.value)}
                className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </Field>
          </div>
          <Field label="عنوان الفصل (اختياري)">
            <input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </Field>
          <Field label="محتوى الفصل *">
            <textarea
              value={newChapterContent}
              onChange={(e) => setNewChapterContent(e.target.value)}
              rows={8}
              className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </Field>
          <button
            type="submit"
            disabled={addingChapter}
            className="self-start rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {addingChapter ? 'جارٍ الإضافة…' : '+ إضافة الفصل'}
          </button>

          {chapterResult && chapterResult.ok && (
            <div className="rounded border border-green-300 bg-green-50 p-3 text-[13px] text-green-800">
              ✅ تم إضافة الفصل.
            </div>
          )}
          {chapterResult && !chapterResult.ok && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">
              ❌ {chapterResult.message}
            </div>
          )}
        </form>
      </div>

      {/* حذف الرواية — منطقة خطر */}
      <div className="mt-10 rounded border border-red-300 p-4">
        <h2 className="mb-1 text-sm font-bold text-red-700">حذف الرواية نهائيًا</h2>
        <p className="mb-3 text-[12px] text-red-700/80">
          هذا الإجراء سيحذف الرواية وكل فصولها ({chapters.length} فصل) نهائيًا ولا يمكن التراجع
          عنه. اكتب عنوان الرواية بالضبط ({title}) للتأكيد.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={title}
            className="flex-1 rounded border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={handleDeleteNovel}
            disabled={deleting}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'جارٍ الحذف…' : 'حذف الرواية نهائيًا'}
          </button>
        </div>
        {deleteError && <p className="mt-2 text-[12px] text-red-700">❌ {deleteError}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
