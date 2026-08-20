const items: {
  label: string;
  href: string;
  gradient: string;
}[] = [
  {
    label: "التصنيفات",
    href: "/categories",
    gradient: "from-rose-300 via-rose-400 to-rose-500",
  },
  {
    label: "الترتيب",
    href: "/rankings",
    gradient: "from-violet-300 via-violet-400 to-violet-500",
  },
  {
    label: "مجاني",
    href: "/categories",
    gradient: "from-emerald-300 via-emerald-400 to-emerald-500",
  },
  {
    label: "مكتمل",
    href: "/completed",
    gradient: "from-blue-300 via-blue-400 to-blue-500",
  },
  {
    label: "كتّاب مميزون",
    href: "/rankings",
    gradient: "from-amber-300 via-amber-400 to-amber-500",
  },
  {
    label: "قوائم الكتب",
    href: "/categories",
    gradient: "from-teal-300 via-teal-400 to-teal-500",
  },
];

export default function MobileQuickNav() {
  return (
    <div className="mt-2 px-2">
      <nav
        aria-label="روابط سريعة"
        className="grid grid-cols-6 gap-x-1 gap-y-3 rounded-3xl border border-ink-300/10 bg-white px-3 py-5 shadow-sm"
      >
        {items.map(({ label, href, gradient }) => (
          <a
            key={label}
            href={href}
            className="flex flex-col items-center gap-2"
          >
            <span
              className={`aspect-square w-full max-w-[52px] rounded-2xl bg-gradient-to-br ${gradient} shadow-inner`}
            />
            <span className="line-clamp-1 text-[13px] font-bold text-ink-900">
              {label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
