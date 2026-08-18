export default function MobileFooter() {
  return (
    <footer className="mt-2 bg-white px-3 py-6 text-center text-[11px] text-ink-300">
      <p>
        نوفل<span className="text-brand">هَب</span> — منصة قراءة الروايات
        المترجمة
      </p>
      <p className="mt-1">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </footer>
  );
}
