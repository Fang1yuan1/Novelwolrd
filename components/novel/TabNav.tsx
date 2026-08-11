const tabs = [
  { id: "info", label: "معلومات العمل" },
  { id: "vote", label: "التصويت التفاعلي" },
  { id: "toc", label: "الفهرس" },
];

export default function TabNav() {
  return (
    <nav
      aria-label="تنقل صفحة الرواية"
      className="flex shrink-0 flex-row gap-1 overflow-x-auto sm:w-32 sm:flex-col sm:overflow-visible lg:w-40"
    >
      {tabs.map((t, i) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className={`shrink-0 rounded border px-3 py-2 text-center text-[13px] font-medium sm:text-start ${
            i === 0
              ? "border-brand/30 bg-brand/10 text-brand"
              : "border-ink-300/15 bg-white text-ink-700 hover:border-brand/30 hover:text-brand"
          }`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
